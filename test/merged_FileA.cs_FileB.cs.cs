using System;
using System.Collections.Generic;

namespace App.Core
{
    public class Logger
    {
        public void Log(string message)
        {
            Console.WriteLine($"[INFO] {DateTime.Now}: {message}");
        }

        public void Error(string error)
        {
            Console.WriteLine($"[ERROR] {DateTime.Now}: {error}");
        }
    }

    public class UserManager
    {
        private readonly List<string> users = new();
        private readonly Logger logger;
        public UserManager(Logger logger)
        {
            this.logger = logger;
        }

        public void AddUser(string username)
        {
            if (!string.IsNullOrWhiteSpace(username))
            {
                users.Add(username);
                logger.Log($"User '{username}' added.");
            }
            else
            {
                logger.Error("Invalid username provided.");
            }
        }

        public void ListUsers()
        {
            logger.Log("Listing all users:");
            foreach (var user in users)
            {
                Console.WriteLine($"- {user}");
            }
        }

        public bool RemoveUser(string username)
        {
            if (users.Remove(username))
            {
                logger.Log($"User '{username}' removed.");
                return true;
            }
            else
            {
                logger.Error($"User '{username}' not found.");
                return false;
            }
        }
    }
}

namespace App.Orders
{
    public class Logger
    {
        public void Log(string message)
        {
            Console.WriteLine($"[INFO] {DateTime.UtcNow}: {message}");
        }

        public void Error(string error)
        {
            Console.WriteLine($"[ERROR] {DateTime.UtcNow}: {error}");
        }
    }

    public class Order
    {
        public string OrderId { get; set; }
        public string Product { get; set; }
        public int Quantity { get; set; }
    }

    public class OrderProcessor
    {
        private readonly List<Order> orders = new();
        private readonly Logger logger;
        public OrderProcessor(Logger logger)
        {
            this.logger = logger;
        }

        public void CreateOrder(string orderId, string product, int quantity)
        {
            if (string.IsNullOrWhiteSpace(orderId) || quantity <= 0)
            {
                logger.Error("Invalid order details.");
                return;
            }

            var order = new Order
            {
                OrderId = orderId,
                Product = product,
                Quantity = quantity
            };
            orders.Add(order);
            logger.Log($"Order '{orderId}' for '{product}' created.");
        }

        public void ListOrders()
        {
            logger.Log("Listing all orders:");
            foreach (var order in orders)
            {
                Console.WriteLine($"Order ID: {order.OrderId}, Product: {order.Product}, Qty: {order.Quantity}");
            }
        }
    }
}
