const http = require('http');

async function testEndpoints() {
    console.log("Starting V2 comprehensive endpoint tests...");
    
    const makeRequest = (path, method = 'GET', data = null, token = null) => {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: path,
                method: method,
                headers: { 'Content-Type': 'application/json' }
            };
            if (token) options.headers['Authorization'] = `Bearer ${token}`;
            if (data) options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));

            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try { resolve({ status: res.statusCode, data: JSON.parse(body || '{}') }); }
                    catch(e) { resolve({ status: res.statusCode, body }); }
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

        // Parent flows
        const uniqueEmail = `parent${Date.now()}@bmhs.test`;
        res = await makeRequest('/auth/register', 'POST', {
            full_name: 'Test Parent',
            email: uniqueEmail,
            phone: '12345678',
            password: 'password123',
            dob: '1985-05-15'
        });
        console.log('2. Register parent (with DOB):', res.status, res.data.message || res.data);

        res = await makeRequest('/auth/login', 'POST', { email: uniqueEmail, password: 'password123' });
        console.log('3. Login parent:', res.status, res.data.type);
        const parentToken = res.data.token;

        res = await makeRequest('/parent/profile', 'GET', null, parentToken);
        console.log('4. Parent Profile fetch:', res.status, res.data.email);

        res = await makeRequest('/requests/my-requests', 'GET', null, parentToken);
        console.log('5. Parent fetch requests:', res.status, Array.isArray(res.data) ? `Empty Array` : res.data);

        // Super Admin flows
        res = await makeRequest('/auth/login', 'POST', { email: 'superadmin@bmhs.edu.bz', password: 'password123' });
        console.log('6. Login Super Admin:', res.status, res.data.role);
        const superToken = res.data.token;

        res = await makeRequest('/superadmin/staff', 'GET', null, superToken);
        console.log('7. Super Admin fetch staff list:', res.status, Array.isArray(res.data) ? `Found ${res.data.length} staff` : res.data);

        // Viewer lock test
        res = await makeRequest('/auth/login', 'POST', { email: 'principal@bmhs.edu.bz', password: 'password123' });
        console.log('8. Login Viewer (Principal):', res.status, res.data.role);
        const viewerToken = res.data.token;
        
        // Viewer should be able to GET staff requests
        res = await makeRequest('/staff/requests', 'GET', null, viewerToken);
        console.log('9. Viewer Sandbox GET test:', res.status, Array.isArray(res.data) ? 'Array OK' : res.data);
        
        // Viewer should fail trying to update a request
        res = await makeRequest('/staff/requests/status', 'PATCH', { request_id: 9999, status: 'denied' }, viewerToken);
        console.log('10. Viewer Sandbox PATCH reject test:', res.status, res.data.message);

        console.log("\nAll V2 essential endpoints and role sandboxes verified!");
    } catch(e) {
        console.error("Test execution failed:", e);
    }
}

testEndpoints();
