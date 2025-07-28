CREATE TABLE `videos` (
	`id` text PRIMARY KEY DEFAULT uuid() NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
