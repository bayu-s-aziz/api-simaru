<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id(); // Kunci utama (primary key) auto-increment
            $table->string('name'); // Nama ruangan
            $table->string('faculty_name'); // Nama fakultas
            $table->longtext('photo')->nullable(); // URL foto, boleh kosong (nullable)
            $table->unsignedInteger('capacity'); // Kapasitas, angka positif

            // Kolom status dengan tipe enum dan nilai default 'draft'
            $table->enum('status', ['draft', 'approved', 'rejected'])->default('draft');

            $table->timestamps(); // Membuat kolom created_at dan updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
