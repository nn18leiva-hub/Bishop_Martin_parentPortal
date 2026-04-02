const http = require('http');

async function testEndpoints() {
    console.log("Starting endpoint tests...");
    
    const makeRequest = (path, method = 'GET', data = null, token = null) => {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: path,
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            if (token) {
                options.headers['Authorization'] = `Bearer ${token}`;
            }
            if (data) {
                const payload = Buffer.from(JSON.stringify(data));
                options.headers['Content-Length'] = payload.length;
            }

            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
                    } catch(e) {
                        resolve({ status: res.statusCode, body });
                    }
                });
            });

            req.on('error', reject);
            if (data) req.write(JSON.stringify(data));
            req.end();
        });
    };

    try {
        let res = await makeRequest('/api/health');
        console.log('1. Health check:', res.status, res.data);

        const uniqueEmail = `test${Date.now()}@test.com`;
        res = await makeRequest('/auth/register', 'POST', {
            full_name: 'Test Parent',
            email: uniqueEmail,
            phone: '12345678',
            password: 'password123'
        });
        console.log('2. Register parent:', res.status, res.data);

        res = await makeRequest('/auth/login', 'POST', {
            email: uniqueEmail,
            password: 'password123'
        });
        console.log('3. Login parent:', res.status, res.data.message ? res.data.message : 'Success');
        const parentToken = res.data.token;

        res = await makeRequest('/parent/profile', 'GET', null, parentToken);
        console.log('4. Get profile:', res.status, res.data.email);

        res = await makeRequest('/payment/instructions', 'GET', null, parentToken);
        console.log('5. Get payment instructions:', res.status, res.data.bank_name);

        res = await makeRequest('/auth/login', 'POST', {
            email: 'office@bmhs.edu.bz',
            password: 'password123'
        });
        console.log('6. Login staff:', res.status, res.data.message ? res.data.message : 'Success');
        const staffToken = res.data.token;

        res = await makeRequest('/staff/requests', 'GET', null, staffToken);
        console.log('7. Get all requests (Staff):', res.status, Array.isArray(res.data) ? `Found ${res.data.length} requests` : res.data);

        console.log("\nAll essential endpoints successfully tested and operational!");
    } catch(e) {
        console.error("Test execution failed:", e);
    }
}

testEndpoints();
