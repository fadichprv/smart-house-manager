-- Smart Shared House Manager - Seed Data
-- Admin password: admin123 (bcrypt hash)
-- User password: user123 (bcrypt hash)

-- Insert admin user
INSERT INTO users (id, name, email, password_hash, role, phone) VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'Admin User',
  'admin@smarthouse.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  '+1234567890'
),
(
  'a0000000-0000-0000-0000-000000000002',
  'Alice Premium',
  'alice@smarthouse.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'premium',
  '+1234567891'
),
(
  'a0000000-0000-0000-0000-000000000003',
  'Bob Normal',
  'bob@smarthouse.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'normal',
  '+1234567892'
),
(
  'a0000000-0000-0000-0000-000000000004',
  'Carol Normal',
  'carol@smarthouse.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'normal',
  '+1234567893'
)
ON CONFLICT (email) DO NOTHING;

-- Insert rooms
INSERT INTO rooms (id, name, description, capacity, room_type, amenities, floor, max_duration_normal, max_duration_premium) VALUES
(
  'b0000000-0000-0000-0000-000000000001',
  'Main Living Room',
  'Spacious living room with TV, comfortable sofas, and a great view. Perfect for relaxing or socializing.',
  8,
  'living_room',
  ARRAY['TV', 'Sofa', 'Air Conditioning', 'WiFi', 'Board Games'],
  1,
  240,
  480
),
(
  'b0000000-0000-0000-0000-000000000002',
  'Study Room A',
  'Quiet study room with individual desks, good lighting, and fast WiFi. Ideal for focused work.',
  4,
  'study',
  ARRAY['Desks', 'WiFi', 'Whiteboard', 'Printer', 'Good Lighting'],
  2,
  180,
  360
),
(
  'b0000000-0000-0000-0000-000000000003',
  'Kitchen & Dining',
  'Fully equipped kitchen with dining area. Has all appliances and cooking utensils.',
  6,
  'kitchen',
  ARRAY['Oven', 'Microwave', 'Refrigerator', 'Dishwasher', 'Coffee Machine', 'Dining Table'],
  1,
  120,
  240
),
(
  'b0000000-0000-0000-0000-000000000004',
  'Gym Room',
  'Well-equipped gym with cardio and strength training equipment.',
  3,
  'gym',
  ARRAY['Treadmill', 'Weights', 'Yoga Mats', 'Resistance Bands', 'Mirror'],
  0,
  90,
  180
),
(
  'b0000000-0000-0000-0000-000000000005',
  'Laundry Room',
  'Laundry room with washing machines and dryers.',
  2,
  'laundry',
  ARRAY['Washing Machine', 'Dryer', 'Iron', 'Ironing Board'],
  0,
  120,
  120
),
(
  'b0000000-0000-0000-0000-000000000006',
  'Rooftop Terrace',
  'Beautiful rooftop terrace with city views, outdoor furniture, and BBQ grill.',
  10,
  'common',
  ARRAY['BBQ Grill', 'Outdoor Furniture', 'City View', 'String Lights', 'Umbrella'],
  4,
  180,
  360
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample donations
INSERT INTO donations (user_id, amount, message, is_anonymous) VALUES
('a0000000-0000-0000-0000-000000000002', 50.00, 'Happy to contribute to our shared home!', false),
('a0000000-0000-0000-0000-000000000003', 25.00, 'For the new coffee machine', false),
('a0000000-0000-0000-0000-000000000004', 15.00, NULL, true),
('a0000000-0000-0000-0000-000000000002', 100.00, 'Monthly contribution', false)
ON CONFLICT DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
('a0000000-0000-0000-0000-000000000003', 'Welcome!', 'Welcome to Smart House Manager. Start by exploring available rooms.', 'info'),
('a0000000-0000-0000-0000-000000000004', 'Welcome!', 'Welcome to Smart House Manager. Start by exploring available rooms.', 'info'),
('a0000000-0000-0000-0000-000000000002', 'Premium Status', 'Your account has been upgraded to Premium. Enjoy extended booking privileges!', 'success')
ON CONFLICT DO NOTHING;
