<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Contact;

class DashboardController extends Controller
{
    /** GET /api/dashboard  (admin) */
    public function index()
    {
        $totalProducts = Product::where('is_active', true)->count();
        $totalOrders   = Order::count();
        $totalContacts = Contact::count();
        $totalRevenue  = Order::sum('total');
        $pendingOrders = Order::where('status', 'pending')->count();

        $recentOrders = Order::orderByDesc('created_at')->limit(10)->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'totalProducts'  => $totalProducts,
                'totalOrders'    => $totalOrders,
                'totalContacts'  => $totalContacts,
                'totalRevenue'   => (float) $totalRevenue,
                'pendingOrders'  => $pendingOrders,
                'recentOrders'   => $recentOrders,
            ],
        ]);
    }
}
