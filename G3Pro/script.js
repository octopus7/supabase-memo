
// Supabase Configuration
// TODO: Replace with your actual Supabase URL and Anon Key
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase Client
const { createClient } = supabase;
// Check if config is set
const isConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

let supabaseClient = null;
if (isConfigured) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn('Supabase is not configured. Creating dummy client for UI testing.');
}

// DOM Elements
const chatArea = document.getElementById('chatArea');
const memoForm = document.getElementById('memoForm');
const memoInput = document.getElementById('memoInput');

// Auto-resize textarea
memoInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if(this.value === '') this.style.height = 'auto'; // Reset when empty
});

// Format Date
function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time only (e.g., "오전 10:30")
    // If not today, show date (e.g., "2023. 10. 27.")
    
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
        return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' });
    }
}

// Render Message
function renderMessage(content, createdAt) {
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper my-message';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content; // Secure text insertion
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = formatTime(createdAt);
    
    wrapper.appendChild(messageContent);
    wrapper.appendChild(messageTime);
    
    chatArea.appendChild(wrapper);
    // Scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Load Memos
async function loadMemos() {
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
        .from('memos')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error loading memos:', error);
        return;
    }

    chatArea.innerHTML = ''; // Clear existing
    data.forEach(memo => {
        renderMessage(memo.content, memo.created_at);
    });
}

// Add Memo
async function addMemo(content) {
    if (!supabaseClient) {
        // UI Demo mode if no backend
        renderMessage(content, new Date().toISOString());
        return;
    }

    const { data, error } = await supabaseClient
        .from('memos')
        .insert([
            { content: content }
        ])
        .select();

    if (error) {
        console.error('Error adding memo:', error);
        alert('메모 저장에 실패했습니다.');
        return;
    }

    if (data && data.length > 0) {
        renderMessage(data[0].content, data[0].created_at);
    }
}

// Event Listeners
memoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = memoInput.value.trim();
    if (!content) return;

    await addMemo(content);
    
    memoInput.value = '';
    memoInput.style.height = 'auto'; // Reset height
    memoInput.focus();
});

// Initial Load
if (isConfigured) {
    loadMemos();
} else {
    // Add a welcome message in demo mode
    renderMessage("Supabase 설정이 필요합니다. script.js 파일에서 URL과 Key를 설정해주세요.", new Date().toISOString());
    renderMessage("이것은 데모 메시지입니다.", new Date().toISOString());
}
