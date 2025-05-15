CREATE TABLE "shops" (
	"shop_id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "shop_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "quantity" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "total" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "profile_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_shop_id_shops_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;