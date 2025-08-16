SHELL := /usr/bin/bash

.PHONY: up down build dev api web seed

up:
	docker compose up -d --build

down:
	docker compose down -v

build:
	docker compose build --no-cache

dev:
	docker compose up

api:
	npm --workspaces --if-present run build -w apps/api && node apps/api/dist/index.js

web:
	npm --workspaces --if-present run dev -w apps/web

seed:
	node scripts/seed.mjs