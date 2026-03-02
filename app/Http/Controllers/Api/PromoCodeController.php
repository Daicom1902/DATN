<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    /** POST /api/promo/validate */
    public function validate(Request $request)
    {
        $request->validate(['code' => 'required|string', 'subtotal' => 'required|numeric|min:0']);

        $promo = PromoCode::where('code', strtoupper($request->code))
            ->where('is_active', true)
            ->first();

        if (!$promo) {
            return response()->json(['success' => false, 'message' => 'Mã không tồn tại hoặc đã hết hạn.'], 404);
        }

        if ($promo->expires_at && $promo->expires_at->isPast()) {
            return response()->json(['success' => false, 'message' => 'Mã đã hết hạn.'], 422);
        }

        if ($promo->max_uses && $promo->used_count >= $promo->max_uses) {
            return response()->json(['success' => false, 'message' => 'Mã đã hết lượt sử dụng.'], 422);
        }

        if ($promo->min_order_value && $request->subtotal < $promo->min_order_value) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng chưa đạt giá trị tối thiểu ' . number_format($promo->min_order_value, 0, ',', '.') . ' ₫',
            ], 422);
        }

        $discount = $promo->discount_type === 'percent'
            ? $request->subtotal * $promo->discount_value / 100
            : $promo->discount_value;

        return response()->json([
            'success'        => true,
            'code'           => $promo->code,
            'discount_type'  => $promo->discount_type,
            'discount_value' => (float) $promo->discount_value,
            'discount_amount'=> (float) $discount,
        ]);
    }
}
