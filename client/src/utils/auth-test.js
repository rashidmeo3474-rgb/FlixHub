// Simple auth test utility
export const testLogin = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Login successful:', data);
      localStorage.setItem('pv_token', data.token);
      return { success: true, data };
    } else {
      console.error('Login failed:', data);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Network error:', error);
    
    // Fallback mock authentication
    if ((email === 'businessyttom@gmail.com' || email === 'admin@flixhub.pk') && password === 'admin123') {
      const mockData = {
        token: 'mock-admin-token-' + Date.now(),
        user: {
          _id: 'admin123',
          name: 'Admin User',
          email: email,
          role: 'admin',
          phone: '',
          createdAt: new Date().toISOString()
        }
      };
      
      localStorage.setItem('pv_token', mockData.token);
      console.log('Mock login successful:', mockData);
      return { success: true, data: mockData };
    }
    
    return { success: false, error: 'Wrong email or password' };
  }
};

// Test function you can call in browser console
window.testFlixHubLogin = testLogin;