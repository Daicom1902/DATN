<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /** POST /api/auth/register */
    public function register(Request $request)
    {
        $data = $request->validate([
            'full_name' => 'required|string|max:120',
            'email'     => 'required|email|unique:users,email',
            'password'  => 'required|string|min:6',
            'phone'     => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'full_name'     => $data['full_name'],
            'email'         => $data['email'],
            'password_hash' => Hash::make($data['password']),
            'phone'         => $data['phone'] ?? null,
            'role'          => 'customer',
            'is_active'     => true,
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => $this->userResource($user),
        ], 201);
    }

    /** POST /api/auth/login */
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password_hash)) {
            return response()->json(['success' => false, 'message' => 'Email hoặc mật khẩu không đúng.'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['success' => false, 'message' => 'Tài khoản đã bị khóa.'], 403);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => $this->userResource($user),
        ]);
    }

    /** POST /api/auth/logout */
    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['success' => true, 'message' => 'Đã đăng xuất.']);
    }

    /** GET /api/auth/me */
    public function me(Request $request)
    {
        return response()->json(['success' => true, 'user' => $this->userResource($request->user())]);
    }

    private function userResource(User $user): array
    {
        return [
            'id'        => $user->id,
            'full_name' => $user->full_name,
            'email'     => $user->email,
            'phone'     => $user->phone,
            'role'      => $user->role,
        ];
    }
}
