const http = require('http');

async function testPastStudents() {
    console.log("Testing Past Student 18+ Validation...");
    
    const makeRequest = (path, method = 'POST', data = null) => {
        return new Promise((resolve) => {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: path,
                method: method,
                headers: { 'Content-Type': 'application/json' }
            };
            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body || '{}') }));
            });
            if (data) req.write(JSON.stringify(data));
            req.end();
        });
    };

    // Test 1: Under 18
    let res = await makeRequest('/auth/register', 'POST', {
        full_name: 'Underage Student',
        email: `underage${Date.now()}@test.com`,
        phone: '12345678',
        password: 'password123',
        user_type: 'past_student',
        dob: new Date(new Date().setFullYear(new Date().getFullYear() - 17)).toISOString().split('T')[0] // 17 years old
    });
    console.log('1. Underage Registration (Expect 403):', res.status, res.data.message);

    // Test 2: 18+
    res = await makeRequest('/auth/register', 'POST', {
        full_name: 'Adult Student',
        email: `adult${Date.now()}@test.com`,
        phone: '12345678',
        password: 'password123',
        user_type: 'past_student',
        dob: new Date(new Date().setFullYear(new Date().getFullYear() - 19)).toISOString().split('T')[0] // 19 years old
    });
    console.log('2. Adult Registration (Expect 201):', res.status, res.data.message);
}

testPastStudents();
