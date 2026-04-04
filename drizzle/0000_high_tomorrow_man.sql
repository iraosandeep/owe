CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`person_name` text NOT NULL,
	`phone` text,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`interest` real,
	`date` text NOT NULL,
	`created_at` text NOT NULL
);
