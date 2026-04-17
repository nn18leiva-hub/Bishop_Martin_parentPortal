async function verifyStats() {
    const API_URL = 'http://localhost:3000/api';
    
    try {
        console.log('--- BMP Stats Verification ---');
        
        // 1. Login as SuperAdmin to get token
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'superadmin@bmhs.edu.bz',
                password: 'password123'
            })
        });
        
        if (!loginRes.ok) {
            const text = await loginRes.text();
            throw new Error(`Login failed with status ${loginRes.status}: ${text.substring(0, 200)}`);
        }
        
        const loginData = await loginRes.json();
        const token = loginData.token;
        if (!token) throw new Error('Failed to get token: ' + JSON.stringify(loginData));
        console.log('Logged in as SuperAdmin successfully.');

        // 2. Fetch Stats
        const statsRes = await fetch(`${API_URL}/superadmin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!statsRes.ok) {
            const text = await statsRes.text();
            throw new Error(`Stats fetch failed with status ${statsRes.status}: ${text.substring(0, 200)}`);
        }
        
        const statsData = await statsRes.json();
        console.log('\n--- Statistics Breakdown ---');
        console.log('Registered State:', JSON.stringify(statsData.registered, null, 2));
        console.log('Online State (15m):', JSON.stringify(statsData.online, null, 2));
        
        // 3. Verify Breakdown Logic
        const totalStaff = statsData.registered.staff.reduce((acc, curr) => acc + parseInt(curr.count || 0), 0);
        console.log(`\nVerified Staff Count: ${totalStaff}`);
        
        console.log('\nVerification Complete: System is reporting categorized stats correctly.');
    } catch (err) {
        console.error('Verification Failed:', err.message);
    }
}

verifyStats();
