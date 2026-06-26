-- ============================================================
-- SEED: Produtos do Depósito Requint's
-- Execute este script no seu banco Deposito_Bebidas
-- ============================================================

USE Deposito_Bebidas;

INSERT INTO produto (nome, tipo, preco, valor_custo, estoque, imagem_url, preco_original) VALUES

-- =========== CERVEJAS ===========
('Cerveja Heineken Lata 350ml',
 'Cerveja',
 5.99, 3.20, 240,
 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400',
 6.99),

('Cerveja Corona Extra Garrafa 330ml',
 'Cerveja',
 7.49, 4.50, 180,
 'https://images.unsplash.com/photo-1611791484670-ce19b801d192?auto=format&fit=crop&q=80&w=400',
 NULL),

('Cerveja Stella Artois Lata 350ml',
 'Cerveja',
 5.49, 3.00, 300,
 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=400',
 NULL),

('Cerveja Budweiser Garrafa 600ml',
 'Cerveja',
 10.99, 6.80, 150,
 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&q=80&w=400',
 12.99),

('Cerveja Brahma Duplo Malte Lata 473ml',
 'Cerveja',
 5.29, 2.90, 360,
 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400',
 NULL),

-- =========== WHISKY ===========
('Whisky Jack Daniel''s Old No.7 1L',
 'Whisky',
 129.90, 85.00, 40,
 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&q=80&w=400',
 149.90),

('Whisky Johnnie Walker Red Label 1L',
 'Whisky',
 119.90, 78.00, 35,
 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=400',
 134.90),

('Whisky Chivas Regal 12 Anos 750ml',
 'Whisky',
 149.90, 98.00, 28,
 'https://images.unsplash.com/photo-1582819509237-d5b75f50ff7b?auto=format&fit=crop&q=80&w=400',
 179.90),

-- =========== GIN ===========
('Gin Tanqueray London Dry 750ml',
 'Gin',
 99.90, 65.00, 45,
 'https://images.unsplash.com/photo-1578496479763-c21887f48b0a?auto=format&fit=crop&q=80&w=400',
 119.90),

('Gin Beefeater London Dry 750ml',
 'Gin',
 89.90, 58.00, 38,
 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?auto=format&fit=crop&q=80&w=400',
 NULL),

-- =========== VODKA ===========
('Vodka Absolut Original 1L',
 'Vodka',
 89.90, 58.00, 60,
 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=400',
 NULL),

('Vodka Smirnoff 998ml',
 'Vodka',
 59.90, 38.00, 90,
 'https://images.unsplash.com/photo-1548001335-7b50db698c13?auto=format&fit=crop&q=80&w=400',
 69.90),

-- =========== VINHO ===========
('Vinho Tinto Casillero del Diablo Cabernet 750ml',
 'Vinho',
 49.90, 32.00, 65,
 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400',
 59.90),

('Vinho Branco Santa Helena Reservado 750ml',
 'Vinho',
 39.90, 25.00, 55,
 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&q=80&w=400',
 NULL),

('Vinho Espumante Chandon Brut 750ml',
 'Espumante',
 89.90, 58.00, 40,
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400',
 99.90),

-- =========== ENERGÉTICO ===========
('Red Bull Energy Drink 250ml',
 'Energético',
 9.49, 5.50, 400,
 'https://images.unsplash.com/photo-1622543953490-0b70d38f822a?auto=format&fit=crop&q=80&w=400',
 10.99),

('Monster Energy Original Lata 473ml',
 'Energético',
 11.49, 6.80, 250,
 'https://images.unsplash.com/photo-1594498653385-d5172c532c00?auto=format&fit=crop&q=80&w=400',
 NULL),

-- =========== REFRIGERANTE ===========
('Coca-Cola Garrafa 2L',
 'Refrigerante',
 9.99, 5.80, 500,
 'https://images.unsplash.com/photo-1567103472667-6898f3a79cf2?auto=format&fit=crop&q=80&w=400',
 NULL),

('Guaraná Antarctica Lata 350ml',
 'Refrigerante',
 4.49, 2.20, 480,
 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400',
 NULL),

-- =========== CACHAÇA / LICOR ===========
('Cachaça Paratí Ouro 1L',
 'Cachaça',
 34.90, 20.00, 80,
 'https://images.unsplash.com/photo-1582819509237-d5b75f50ff7b?auto=format&fit=crop&q=80&w=400',
 39.90),

('Licor 43 700ml',
 'Licor',
 89.90, 58.00, 30,
 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?auto=format&fit=crop&q=80&w=400',
 NULL),

-- =========== ÁGUA / ISOTÔNICO ===========
('Água Tônica Schweppes 350ml',
 'Mixer',
 4.99, 2.50, 350,
 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=400',
 NULL),

('Gatorade Limão 500ml',
 'Isotônico',
 7.99, 4.50, 200,
 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
 NULL);

-- Confirmação
SELECT
  COUNT(*) AS total_produtos,
  SUM(estoque) AS total_estoque
FROM produto;
