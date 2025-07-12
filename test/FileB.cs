using System;

namespace App.Core
{
    public class Logger
    {

        public void LogInfo(string message)
        {
            Console.WriteLine($"[INFO]: {message}");
        }

        public void LogError(string message)
        {
            Console.WriteLine($"[ERROR]: {message}");
        }
    }
}

namespace App.Services
{
    public class OrderService
    {
        private readonly App.Core.Logger _logger;

        public OrderService(App.Core.Logger logger)
        {
            _logger = logger;
        }

        public void CreateOrder(string orderId)
        {
            if (string.IsNullOrEmpty(orderId))
            {
                _logger.LogWarning("Empty order ID.");
                return;
            }

            _logger.LogInfo($"Order '{orderId}' created.");
        }
    }
}
