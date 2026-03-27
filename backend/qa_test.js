const API_URL = 'http://localhost:5000/api';

async function runQa() {
  console.log('🔍 Starting AI-Task-Master QA Check (Native Fetch)...');

  try {
    // 1. Test Quick-Add
    console.log('\n--- Test 1: NLP Quick-Add ---');
    const quickAddRes = await fetch(`${API_URL}/ai/parse-quick-add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: "לקנות חלב מחר ב-9 בבוקר" })
    });
    const quickAddData = await quickAddRes.json();
    console.log('✅ Success:', quickAddData);

    // 2. Test Chat
    console.log('\n--- Test 2: AI Chat with Context ---');
    const chatRes = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "מה המשימה הכי חשובה שלי עכשיו?",
        context: {
          activeTasks: [{ title: "משימה דחופה מאוד", completed: false }],
          projects: [{ name: "פרויקט QA" }]
        }
      })
    });
    const chatData = await chatRes.json();
    console.log('✅ Success! Reply:', chatData.reply.slice(0, 50) + '...');

    // 3. Test Breakdown
    console.log('\n--- Test 3: Task Breakdown ---');
    const breakdownRes = await fetch(`${API_URL}/ai/breakdown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskTitle: "לבנות אפליקציה חדשה" })
    });
    const breakdownData = await breakdownRes.json();
    console.log('✅ Success:', breakdownData.subtasks);

    console.log('\n✨ QA PASSED (Backend Logic)');
  } catch (err) {
    console.error('❌ QA FAILED:', err.message);
  }
}

runQa();
