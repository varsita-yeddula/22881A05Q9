const LOGGING_CONFIG = {
  API_URL: 'http://70.244.56.144/evaluation-service/logs',
  AUTH_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ2YXJzaXRhc3llZGR1bGFAZ21haWwuY29tIiwiZXhwIjoxNzUzNjgyMzMzLCJpYXQiOjE3NTM2ODE0MzMsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiJiODY5MjYzNC0xNDJhLTRiYzEtYTBlYS02NzEwOWQxNjAzNmIiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJ2YXJzaXRhIHNhaSB5ZWRkdWxhIiwic3ViIjoiZDdhZmJhMDMtNzljMi00ZDEzLWFmMzctZGIyZjVmNzBkODM0In0sImVtYWlsIjoidmFyc2l0YXN5ZWRkdWxhQGdtYWlsLmNvbSIsIm5hbWUiOiJ2YXJzaXRhIHNhaSB5ZWRkdWxhIiwicm9sbE5vIjoiMjI4ODFhMDVxOSIsImFjY2Vzc0NvZGUiOiJ3UEVmR1oiLCJjbGllbnRJRCI6ImQ3YWZiYTAzLTc5YzItNGQxMy1hZjM3LWRiMmY1ZjcwZDgzNCIsImNsaWVudFNlY3JldCI6InpjUFpuUnRqc25iRG56ZHYifQ.JSOmB5ks20BAH8bk9cIMh3FXpdFPAp6VRXvoBcBYJ0k",
};

// Valid values for logging parameters
const VALID_STACKS = ['backend', 'frontend'];
const VALID_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const VALID_BACKEND_PACKAGES = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'];
const VALID_FRONTEND_PACKAGES = ['api', 'component', 'hook', 'page', 'state', 'style'];
const VALID_UNIVERSAL_PACKAGES = ['auth', 'config', 'middleware', 'utils'];

/**
 * Reusable logging function that sends logs to the test server
 * @param {string} stack - 'backend' or 'frontend'
 * @param {string} level - 'debug', 'info', 'warn', 'error', or 'fatal'
 * @param {string} package - Package name based on stack type
 * @param {string} message - Descriptive log message
 * @returns {Promise<object>} Response from logging API
 */
async function Log(stack, level, packageName, message) {
  // Validate parameters
  if (!VALID_STACKS.includes(stack.toLowerCase())) {
    throw new Error(`Invalid stack: ${stack}. Must be one of: ${VALID_STACKS.join(', ')}`);
  }
  
  if (!VALID_LEVELS.includes(level.toLowerCase())) {
    throw new Error(`Invalid level: ${level}. Must be one of: ${VALID_LEVELS.join(', ')}`);
  }

  // Validate package based on stack
  const validPackages = stack.toLowerCase() === 'backend' 
    ? [...VALID_BACKEND_PACKAGES, ...VALID_UNIVERSAL_PACKAGES]
    : [...VALID_FRONTEND_PACKAGES, ...VALID_UNIVERSAL_PACKAGES];
  
  if (!validPackages.includes(packageName.toLowerCase())) {
    throw new Error(`Invalid package '${packageName}' for stack '${stack}'. Valid packages: ${validPackages.join(', ')}`);
  }

  try {
    const response = await fetch(LOGGING_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOGGING_CONFIG.AUTH_TOKEN}`
      },
      body: JSON.stringify({
        stack: stack.toLowerCase(),
        level: level.toLowerCase(), 
        package: packageName.toLowerCase(),
        message: message
      })
    });

    if (!response.ok) {
      throw new Error(`Logging API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Log sent successfully:', result);
    return result;
  } catch (error) {
    // Fallback to console logging if API fails
    console.error('Failed to send log to server:', error);
    console.log(`[${stack.toUpperCase()}][${level.toUpperCase()}][${packageName}] ${message}`);
    throw error;
  }
}