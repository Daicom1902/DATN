<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PromoCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /** GET /api/orders  (admin) */
    public function index()
    {
        $orders = Order::orderByDesc('created_at')->get();
        return response()->json(['success' => true, 'data' => $orders]);
    }

    /** GET /api/orders/{id}  (admin) */
    public function show($id)
    {
        $order = Order::with('items')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $order]);
    }

    /** GET /api/orders/my  (customer – own orders) */
    public function myOrders(Request $request)
    {
        $orders = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();
        return response()->json(['success' => true, 'data' => $orders]);
    }

    /**
     * POST /api/orders
     * Body: { customer_name, customer_email, customer_phone,
     *         shipping_address, shipping_city,
     *         items: [{product_id, variant_id?, product_name, size_label, unit_price, quantity, image_url}],
     *         promo_code?, payment_method? }
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name'    => 'required|string|max:120',
            'customer_email'   => 'required|email',
            'customer_phone'   => 'nullable|string|max:20',
            'shipping_address' => 'required|string|max:255',
            'shipping_ward'    => 'nullable|string|max:100',
            'shipping_district'=> 'nullable|string|max:100',
            'shipping_city'    => 'required|string|max:100',
            'payment_method'   => 'nullable|string|in:cod,bank_transfer,vnpay,momo',
            'note'             => 'nullable|string',
            'promo_code'       => 'nullable|string|max:50',
            'items'            => 'required|array|min:1',
            'items.*.product_id'  => 'nullable|integer',
            'items.*.variant_id'  => 'nullable|integer',
            'items.*.product_name'=> 'required|string',
            'items.*.size_label'  => 'nullable|string',
            'items.*.unit_price'  => 'required|numeric|min:0',
            'items.*.quantity'    => 'required|integer|min:1',
            'items.*.image_url'   => 'nullable|string',
        ]);

        // Calculate totals
        $subtotal = collect($data['items'])->sum(fn($i) => $i['unit_price'] * $i['quantity']);
        $discountAmount = 0;
        $promoCodeId    = null;

        if (!empty($data['promo_code'])) {
            $promo = PromoCode::where('code', $data['promo_code'])
                ->where('is_active', true)
                ->first();

            if ($promo && (!$promo->expires_at || $promo->expires_at->isFuture())
                && (!$promo->max_uses || $promo->used_count < $promo->max_uses)
                && $subtotal >= ($promo->min_order_value ?? 0)) {
                $discountAmount = $promo->discount_type === 'percent'
                    ? $subtotal * $promo->discount_value / 100
                    : $promo->discount_value;
                $promoCodeId = $promo->id;
                $promo->increment('used_count');
            }
        }

        $tax   = ($subtotal - $discountAmount) * 0.1;
        $total = $subtotal - $discountAmount + $tax;

        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id'          => auth('api')->id(),
                'customer_name'    => $data['customer_name'],
                'customer_email'   => $data['customer_email'],
                'customer_phone'   => $data['customer_phone'] ?? null,
                'shipping_address' => $data['shipping_address'],
                'shipping_ward'    => $data['shipping_ward'] ?? null,
                'shipping_district'=> $data['shipping_district'] ?? null,
                'shipping_city'    => $data['shipping_city'],
                'subtotal'         => $subtotal,
                'discount_amount'  => $discountAmount,
                'shipping_fee'     => 0,
                'tax_amount'       => $tax,
                'total'            => $total,
                'promo_code_id'    => $promoCodeId,
                'promo_code_used'  => $data['promo_code'] ?? null,
                'payment_method'   => $data['payment_method'] ?? 'cod',
                'payment_status'   => 'unpaid',
                'status'           => 'pending',
                'note'             => $data['note'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                OrderItem::create([
                    'order_id'     => $order->id,
                    'product_id'   => $item['product_id'] ?? null,
                    'variant_id'   => $item['variant_id'] ?? null,
                    'product_name' => $item['product_name'],
                    'size_label'   => $item['size_label'] ?? null,
                    'unit_price'   => $item['unit_price'],
                    'quantity'     => $item['quantity'],
                    'subtotal'     => $item['unit_price'] * $item['quantity'],
                    'image_url'    => $item['image_url'] ?? null,
                ]);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }

        return response()->json(['success' => true, 'data' => $order->load('items')], 201);
    }

    /** PUT /api/orders/{id}  (admin – update status) */
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $data  = $request->validate([
            'status'         => 'sometimes|string|in:pending,processing,shipped,delivered,cancelled',
            'payment_status' => 'sometimes|string|in:unpaid,paid,refunded',
        ]);
        $order->update($data);
        return response()->json(['success' => true, 'data' => $order]);
    }

    /** DELETE /api/orders/{id}  (admin) */
    public function destroy($id)
    {
        Order::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }
}
