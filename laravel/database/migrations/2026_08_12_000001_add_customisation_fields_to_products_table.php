<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'is_customisable')) {
                $table->boolean('is_customisable')->default(false)->after('is_featured');
            }
            if (!Schema::hasColumn('products', 'customisation_items')) {
                $table->json('customisation_items')->nullable()->after('is_customisable');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'is_customisable')) {
                $table->dropColumn('is_customisable');
            }
            if (Schema::hasColumn('products', 'customisation_items')) {
                $table->dropColumn('customisation_items');
            }
        });
    }
};
