<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    /** POST /api/contact */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'    => 'required|string|max:120',
            'email'   => 'required|email',
            'phone'   => 'nullable|string|max:20',
            'subject' => 'required|string|max:200',
            'message' => 'required|string',
        ]);

        $contact = Contact::create($data);

        return response()->json(['success' => true, 'data' => $contact], 201);
    }

    /** GET /api/contact  (admin) */
    public function index()
    {
        $contacts = Contact::orderByDesc('created_at')->get();
        return response()->json(['success' => true, 'data' => $contacts]);
    }

    /** GET /api/contact/{id}  (admin) */
    public function show($id)
    {
        $contact = Contact::findOrFail($id);
        $contact->update(['is_read' => true]);
        return response()->json(['success' => true, 'data' => $contact]);
    }

    /** DELETE /api/contact/{id}  (admin) */
    public function destroy($id)
    {
        Contact::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }
}
