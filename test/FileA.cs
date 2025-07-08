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
    public class UserService
    {
        private readonly App.Core.Logger _logger;

        public UserService(App.Core.Logger logger)
        {
            _logger = logger;
        }

        public void AddUser(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                _logger.LogError("Invalid username.");
                return;
            }

            _logger.LogInfo($"User '{username}' added.");
        }

        public void RemoveUser(string username)
        {
            _logger.LogInfo($"User '{username}' removed.");
        }
    }
}

