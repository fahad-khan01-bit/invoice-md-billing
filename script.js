let selectedServer = 1;
let currentInvoice = null;

function addItem() {
    const container = document.getElementById('itemsContainer');
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
        <input type="text" class="item-name" placeholder="آئٹم کا نام">
        <input type="number" class="item-qty" placeholder="مقدار" value="1" min="1">
        <input type="number" class="item-price" placeholder="قیمت" min="0">
        <button class="remove-item" onclick="removeItem(this)"><i class="fas fa-trash"></i></button>
    `;
    container.appendChild(row);
    updateTotal();
    row.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', updateTotal);
    });
}

function removeItem(btn) {
    const rows = document.querySelectorAll('.item-row');
    if (rows.length > 1) {
        btn.closest('.item-row').remove();
        updateTotal();
    }
}

function updateTotal() {
    let total = 0;
    document.querySelectorAll('.item-row').forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        total += qty * price;
    });
    document.getElementById('totalAmount').textContent = 'Rs. ' + total.toLocaleString();
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.item-row input').forEach(inp => {
        inp.addEventListener('input', updateTotal);
    });
});

function selectServer(el, num) {
    document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    selectedServer = num;
}

function generateBill() {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const title = document.getElementById('billTitle').value.trim();
    
    if (!name || !phone || !title) {
        alert('براہ کرم گاہک کا نام، واٹس ایپ نمبر اور بل کا عنوان ضرور درج کریں');
        return;
    }
    
    const items = [];
    document.querySelectorAll('.item-row').forEach(row => {
        const itemName = row.querySelector('.item-name').value.trim();
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        if (itemName && qty > 0) {
            items.push({ name: itemName, qty, price, total: qty * price });
        }
    });
    
    if (items.length === 0) {
        alert('براہ کرم کم از کم ایک آئٹم شامل کریں');
        return;
    }
    
    const invoiceNumber = 'INV-' + Date.now().toString(36).toUpperCase();
    const total = items.reduce((sum, item) => sum + item.total, 0);
    const date = new Date().toLocaleDateString('ur-PK', { year: 'numeric', month: 'long', day: 'numeric' });
    
    currentInvoice = {
        number: invoiceNumber,
        customer: name,
        phone: phone,
        title: title,
        items: items,
        total: total,
        date: date
    };
    
    renderInvoice(currentInvoice);
    document.getElementById('whatsappSection').style.display = 'block';
    document.getElementById('responseBox').textContent = '✔ بل تیار ہے۔ اب واٹس ایپ پر بھیجنے کے لیے سرور منتخب کریں';
    document.getElementById('responseBox').style.color = '#00ff88';
    document.getElementById('limitCount').textContent = Math.floor(Math.random() * 10) + 1;
}

function renderInvoice(inv) {
    const box = document.getElementById('previewBox');
    let itemsHtml = '';
    inv.items.forEach((item, i) => {
        itemsHtml += `<tr>
            <td>${i + 1}. ${item.name}</td>
            <td>${item.qty}</td>
            <td>Rs. ${item.price.toLocaleString()}</td>
            <td>Rs. ${item.total.toLocaleString()}</td>
        </tr>`;
    });
    
    box.innerHTML = `
        <div class="invoice-generated">
            <div class="invoice-header">
                <h3>INVOICE MD</h3>
                <div class="inv-number">${inv.number}</div>
                <div style="font-size:12px;color:#666;margin-top:4px">${inv.date}</div>
            </div>
            <div class="invoice-body">
                <div class="info-row">
                    <span>گاہک:</span>
                    <span>${inv.customer}</span>
                </div>
                <div class="info-row">
                    <span>واٹس ایپ:</span>
                    <span>+${inv.phone}</span>
                </div>
                <div class="info-row">
                    <span>عنوان:</span>
                    <span>${inv.title}</span>
                </div>
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>آئٹم</th>
                            <th>مقدار</th>
                            <th>قیمت/واحد</th>
                            <th>کل</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <div class="invoice-total">
                    کل رقم: <span>Rs. ${inv.total.toLocaleString()}</span>
                </div>
            </div>
        </div>
    `;
}

function sendToWhatsApp() {
    if (!currentInvoice) {
        alert('پہلے بل جنریٹ کریں');
        return;
    }
    
    const btn = document.querySelector('.send-btn');
    btn.innerHTML = '<span class="spinner"></span> بھیجا جا رہا ہے...';
    btn.disabled = true;
    
    const responseBox = document.getElementById('responseBox');
    
    let message = `📄 *INVOICE MD*\n`;
    message += `🔢 بل نمبر: ${currentInvoice.number}\n`;
    message += `📅 تاریخ: ${currentInvoice.date}\n`;
    message += `👤 گاہک: ${currentInvoice.customer}\n`;
    message += `📋 عنوان: ${currentInvoice.title}\n`;
    message += `━━━━━━━━━━━━━━━━\n`;
    message += `*آئٹمز:*\n`;
    
    currentInvoice.items.forEach((item, i) => {
        message += `${i+1}. ${item.name} × ${item.qty} = Rs. ${item.total.toLocaleString()}\n`;
    });
    
    message += `━━━━━━━━━━━━━━━━\n`;
    message += `*کل رقم: Rs. ${currentInvoice.total.toLocaleString()}*\n`;
    message += `━━━━━━━━━━━━━━━━\n`;
    message += `🟢 سرور ${selectedServer} کے ذریعے بھیجا گیا`;
    
    const encodedMessage = encodeURIComponent(message);
    const phone = currentInvoice.phone.replace(/[^0-9]/g, '');
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fab fa-whatsapp"></i> واٹس ایپ پر بھیجیں';
        btn.disabled = false;
        window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
        responseBox.innerHTML = `<i class="fas fa-check-circle" style="color:#00ff88"></i> 
            بل کامیابی سے واٹس ایپ پر کھل گیا! 
            <br><small>میسج آئی ڈی: ${currentInvoice.number}-${Date.now().toString(36)}</small>`;
        responseBox.style.color = '#00ff88';
    }, 1500);
}
