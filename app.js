
(()=> {
    'use strict';

// app settings

    const KEY='TKN.v1';
    const defaults= {
        shopName:'TKN',
        eventName:'Event',
        products:[
            {id:'p1',name:'Lily',price:25},
            {id:'p2',name:'Nintendo Switch',price:3000},
            {id:'p3',name:'Lego',price:120},
            {id:'p4',name:'Lexus',price:15000},
            {id:'p5',name:'Steak',price:65},
            {id:'p6',name:'Imli',price:6}
        ],
        sales:[],
        celebrated500:false,
        celebrated1000:false
    };

    let state=load(), cart={};

    const $=id=>document.getElementById(id);
    const money=n=>'AED '+Number(n||0).toLocaleString('en-AE',{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    });

    function clone(x) {
        return JSON.parse(JSON.stringify(x));
    }

    function load() {
        try {
            const x=JSON.parse(localStorage.getItem(KEY));
            if(x&&Array.isArray(x.products)&&Array.isArray(x.sales)) {
                return {...clone(defaults),...x};
            }
        } catch(e) {}
        return clone(defaults);
    }

    function persist() {
        try {
            localStorage.setItem(KEY,JSON.stringify(state));
        } catch(e) {
            toast('Could not save: device storage may be full. Export a backup.');
        }
    }

    function toast(msg) {
        const el=$('toast');
        el.textContent=msg;
        el.classList.add('show');
        clearTimeout(toast.timer);
        toast.timer=setTimeout(()=>el.classList.remove('show'),2500);
    }

// when 500 or 1000 is hit

    function showCelebration(amount=500) {
        const overlay=document.createElement('div');
        overlay.className='celebration-overlay';

        overlay.innerHTML=`
            <div class="celebration-card">
                <div class="celebration-icon">🎉</div>
                <h2>Time to take Duaa out!</h2>
                <p>You've reached AED ${amount.toLocaleString('en-AE')} in total sales. So sexy!</p>
                <button type="button">Business woman!</button>
            </div>
        `;

        document.body.appendChild(overlay);

        const closeCelebration=()=>{
            overlay.remove();
            document.querySelectorAll('.celebration-confetti')
                .forEach(item=>item.remove());
        };

        overlay.querySelector('button').onclick=closeCelebration;
        overlay.onclick=e=>{
            if(e.target===overlay) closeCelebration();
        };

        const pieces=['🎉','✨','🎊','🤎','⭐'];

        for(let i=0;i<35;i++) {
            const piece=document.createElement('span');
            piece.className='celebration-confetti';
            piece.textContent=pieces[Math.floor(Math.random()*pieces.length)];
            piece.style.left=Math.random()*100+'vw';
            piece.style.animationDelay=Math.random()*1.5+'s';
            document.body.appendChild(piece);
        }

        setTimeout(closeCelebration,6000);
    }

    function totalRevenue() {
        return state.sales.reduce((sum,sale)=>sum+(Number(sale.total)||0),0);
    }

// alu

    function total() {
        return Object.entries(cart).reduce(
            (s,[id,q])=>s+(Number(state.products.find(p=>p.id===id)?.price)||0)*q,
            0
        );
    }

    function count() {
        return Object.values(cart).reduce((a,b)=>a+b,0);
    }

    function esc(s) {
        return String(s).replace(/[&<>"']/g,c=>({
            '&':'&amp;',
            '<':'&lt;',
            '>':'&gt;',
            '"':'&quot;',
            "'":'&#39;'
        }[c]));
    }

// main screen rendering

    function render() {
        $('shopTitle').textContent=state.shopName||'TKN';
        $('eventSubtitle').textContent=state.eventName||'Sales';
        $('eventLabel').textContent='Event: '+(state.eventName||'Event');

        renderProducts();
        renderCart();
        renderAdmin();
        renderHistory();

        $('shopNameInput').value=state.shopName||'';
        $('eventNameInput').value=state.eventName||'';
        document.title=(state.shopName||'TKN')+' — Sales';
    }

    function renderProducts() {
        const grid=$('productGrid');
        grid.innerHTML='';

        const available=state.products.filter(p=>p.active!==false);

        if(!available.length) {
            grid.innerHTML='<div class="empty">No products yet. Add some in Products.</div>';
            return;
        }

        available.forEach(p=>{
            const b=document.createElement('button');
            b.className='product';

            b.innerHTML=
                (cart[p.id]?'<span class="count">'+cart[p.id]+'</span>':'')+
                '<div class="name">'+esc(p.name)+'</div>'+
                '<div class="price">'+money(p.price)+'</div>';

            b.onclick=()=>{
                cart[p.id]=(cart[p.id]||0)+1;
                renderProducts();
                renderCart();
            };

            grid.appendChild(b);
        });
    }

    function renderCart() {
        const el=$('cartItems');

        const entries=Object.entries(cart).filter(
            ([id,q])=>q>0&&state.products.some(p=>p.id===id)
        );

        if(!entries.length) {
            el.innerHTML=
                '<div class="empty">Your order is empty.<br>Tap a product to begin.</div>';
        } else {
            el.innerHTML=entries.map(([id,q])=>{
                const p=state.products.find(x=>x.id===id);

                return '<div class="cart-row">'+
                    '<div>'+
                        '<div class="cart-name">'+esc(p.name)+'</div>'+
                        '<div class="cart-sub">'+money(p.price)+' × '+q+' = '+money(p.price*q)+'</div>'+
                    '</div>'+
                    '<div class="qty">'+
                        '<button data-minus="'+id+'" aria-label="Remove one">−</button>'+
                        '<span>'+q+'</span>'+
                        '<button data-plus="'+id+'" aria-label="Add one">+</button>'+
                    '</div>'+
                '</div>';
            }).join('');
        }

        el.querySelectorAll('[data-minus]').forEach(b=>{
            b.onclick=()=>{
                const id=b.dataset.minus;
                cart[id]--;
                if(cart[id]<=0) delete cart[id];
                renderProducts();
                renderCart();
            };
        });

        el.querySelectorAll('[data-plus]').forEach(b=>{
            b.onclick=()=>{
                cart[b.dataset.plus]++;
                renderProducts();
                renderCart();
            };
        });

        $('cartTotal').textContent=money(total());
        $('cashBtn').disabled=!entries.length;
        $('cardBtn').disabled=!entries.length;
    }

    function renderAdmin() {
        const el=$('productAdmin');

        if(!state.products.length) {
            el.innerHTML='<div class="empty">No products. Add your first product.</div>';
            return;
        }

        el.innerHTML=state.products.map(p=>
            '<div class="product-admin">'+
                '<div class="info">'+
                    '<strong>'+esc(p.name)+(p.active===false?' · hidden':'')+'</strong>'+
                    '<small>'+money(p.price)+'</small>'+
                '</div>'+
                '<button class="btn small ghost" data-edit="'+p.id+'">Edit</button>'+
                '<button class="btn small '+(p.active===false?'':'ghost')+'" data-toggle="'+p.id+'">'+
                    (p.active===false?'Show':'Hide')+
                '</button>'+
                '<button class="btn small danger" data-delete="'+p.id+'">×</button>'+
            '</div>'
        ).join('');

        el.querySelectorAll('[data-edit]').forEach(b=>{
            b.onclick=()=>openProduct(b.dataset.edit);
        });

        el.querySelectorAll('[data-toggle]').forEach(b=>{
            b.onclick=()=>{
                const p=state.products.find(p=>p.id===b.dataset.toggle);
                p.active=p.active===false?true:false;
                persist();
                render();
            };
        });

        el.querySelectorAll('[data-delete]').forEach(b=>{
            b.onclick=()=>{
                const p=state.products.find(p=>p.id===b.dataset.delete);

                if(confirm('Delete '+p.name+'? Past sales will remain in history.')) {
                    state.products=state.products.filter(x=>x.id!==p.id);
                    delete cart[p.id];
                    persist();
                    render();
                }
            };
        });
    }

    function renderHistory() {
        const sales=[...state.sales].reverse();

        const sum=method=>state.sales
            .filter(s=>method==='all'||s.method===method)
            .reduce((n,s)=>n+s.total,0);

        $('statRevenue').textContent=money(sum('all'));
        $('statCash').textContent=money(sum('cash'));
        $('statCard').textContent=money(sum('card'));
        $('historyEvent').textContent=state.sales.length+' saved sale(s) · all events';

        $('salesList').innerHTML=sales.length?sales.map(s=>
            '<div class="sale">'+
                '<div>'+
                    '<strong>'+esc(s.event)+' · '+money(s.total)+'</strong>'+
                    '<small>'+
                        new Date(s.time).toLocaleString()+'<br>'+
                        s.items.map(i=>esc(i.name)+' × '+i.qty).join(', ')+'<br>'+
                        'Paid: '+(s.method==='cash'
                            ?'Cash · received '+money(s.received)+' · change '+money(s.change)
                            :'Card · Ziina')+
                    '</small>'+
                '</div>'+
                '<span class="pill '+(s.method==='card'?'card':'')+'">'+
                    (s.method==='cash'?'CASH':'CARD')+
                '</span>'+
            '</div>'
        ).join(''):'<div class="panel empty">No sales recorded yet. Your completed sales will appear here.</div>';
    }

    // navigation 

    function openModal(id) {
        $(id).classList.add('open');
    }

    function closeModal(id) {
        $(id).classList.remove('open');
    }

    function go(view) {
        document.querySelectorAll('.view').forEach(v=>
            v.classList.toggle('active',v.id===view)
        );

        document.querySelectorAll('.tab').forEach(t=>
            t.classList.toggle('active',t.dataset.view===view)
        );

        if(view==='history') renderHistory();

        window.scrollTo({top:0,behavior:'smooth'});
    }

    function openProduct(id) {
        const p=state.products.find(p=>p.id===id);

        $('editingProductId').value=id||'';
        $('productModalTitle').textContent=p?'Edit product':'Add product';
        $('productName').value=p?.name||'';
        $('productPrice').value=p?.price??'';

        openModal('productModal');
    }

// checkout

    function finishSale(method,received=0) {
        const sum=total();

        if(!count()||sum<=0) {
            toast('Add products with a price above AED 0 first.');
            return;
        }

        if(method==='cash'&&received<sum) {
            toast('Cash received must cover the total.');
            return;
        }

// check the revenue

        const revenueBefore=totalRevenue();

        const items=Object.entries(cart).map(([id,qty])=>{
            const p=state.products.find(p=>p.id===id);

            return {
                id,
                name:p?.name||'Deleted product',
                price:Number(p?.price)||0,
                qty
            };
        });

        state.sales.push({
            id:'s'+Date.now()+'-'+Math.random().toString(36).slice(2,7),
            time:new Date().toISOString(),
            event:state.eventName||'My event',
            items,
            total:sum,
            method,
            received:method==='cash'?received:sum,
            change:method==='cash'?Math.round((received-sum)*100)/100:0
        });

        const revenueAfter=totalRevenue();

        const celebrate500=
            revenueBefore<500 &&
            revenueAfter>=500 &&
            !state.celebrated500;

        const celebrate1000=
            revenueBefore<1000 &&
            revenueAfter>=1000 &&
            !state.celebrated1000;

        if(celebrate500) {
            state.celebrated500=true;
        }

        if(celebrate1000) {
            state.celebrated1000=true;
        }

        cart={};
        persist();
        render();
        closeModal('cashModal');
        closeModal('cardModal');
        go('sell');
        toast('Sale saved · '+money(sum));

        if(celebrate1000) {
            setTimeout(()=>showCelebration(1000),350);
        } else if(celebrate500) {
            setTimeout(()=>showCelebration(500),350);
        }
    }

    // buttons

    document.querySelectorAll('.tab').forEach(b=>{
        b.onclick=()=>go(b.dataset.view);
    });

    $('settingsShortcut').onclick=()=>go('settings');
    $('backupBtn').onclick=exportBackup;

    $('clearCart').onclick=()=>{
        cart={};
        renderProducts();
        renderCart();
    };

    $('addProductBtn').onclick=()=>openProduct('');

    $('saveProduct').onclick=()=>{
        const name=$('productName').value.trim();
        const price=Number($('productPrice').value);

        if(!name) {
            toast('Enter a product name.');
            return;
        }

        if($('productPrice').value===''||!Number.isFinite(price)||price<0) {
            toast('Enter a valid price.');
            return;
        }

        const id=$('editingProductId').value;

        if(id) {
            const p=state.products.find(p=>p.id===id);
            p.name=name;
            p.price=Math.round(price*100)/100;
        } else {
            state.products.push({
                id:'p'+Date.now(),
                name,
                price:Math.round(price*100)/100
            });
        }

        persist();
        render();
        closeModal('productModal');
        toast('Product saved');
    };

    $('cashBtn').onclick=()=>{
        if(!count()) return;

        $('cashTotal').textContent=money(total());
        $('cashReceived').value='';
        updateChange();
        openModal('cashModal');
        setTimeout(()=>$('cashReceived').focus(),100);
    };

    $('cardBtn').onclick=()=>{
        if(!count()) return;

        $('cardTotal').textContent=money(total());
        openModal('cardModal');
    };

    function updateChange() {
        const received=Number($('cashReceived').value)||0;
        const diff=Math.round((received-total())*100)/100;

        $('changeLabel').textContent=diff<0?'Still owed':'Change to give';
        $('changeAmount').textContent=money(Math.abs(diff));
        $('changeAmount').style.color=diff<0?'#9a463d':'#356749';
        $('completeCash').disabled=received<total();
    }

    $('cashReceived').addEventListener('input',updateChange);

    document.querySelectorAll('[data-cash]').forEach(b=>{
        b.onclick=()=>{
            $('cashReceived').value=Number(b.dataset.cash);
            updateChange();
        };
    });

    $('exactCash').onclick=()=>{
        $('cashReceived').value=total().toFixed(2);
        updateChange();
    };

    $('completeCash').onclick=()=>{
        finishSale('cash',Math.round(Number($('cashReceived').value)*100)/100);
    };

    $('confirmCard').onclick=()=>finishSale('card');

    document.querySelectorAll('[data-close]').forEach(b=>{
        b.onclick=()=>closeModal(b.dataset.close);
    });

    document.querySelectorAll('.overlay').forEach(o=>{
        o.addEventListener('click',e=>{
            if(e.target===o) closeModal(o.id);
        });
    });

    $('changeEvent').onclick=()=>{
        $('newEventName').value=state.eventName||'';
        openModal('eventModal');
    };

    $('saveEvent').onclick=()=>{
        state.eventName=$('newEventName').value.trim()||'My event';
        persist();
        render();
        closeModal('eventModal');
        toast('Event updated');
    };

    $('saveSettings').onclick=()=>{
        state.shopName=$('shopNameInput').value.trim()||'My Shop';
        state.eventName=$('eventNameInput').value.trim()||'My event';
        persist();
        render();
        toast('Settings saved');
    };

// backup

    function exportBackup() {
        const blob=new Blob([
            JSON.stringify({...state,backupCreated:new Date().toISOString()},null,2)
        ],{type:'application/json'});

        download(
            blob,
            'little-till-backup-'+new Date().toISOString().slice(0,10)+'.json'
        );

        toast('Backup exported');
    }

    function download(blob,name) {
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a');

        a.href=url;
        a.download=name;
        document.body.appendChild(a);
        a.click();
        a.remove();

        setTimeout(()=>URL.revokeObjectURL(url),1000);
    }

    $('exportBackup').onclick=exportBackup;

    $('importFile').onchange=async e=>{
        const file=e.target.files[0];
        if(!file) return;

        try {
            const data=JSON.parse(await file.text());

            if(!Array.isArray(data.products)||!Array.isArray(data.sales)) {
                throw new Error('This does not look like a Little Till backup.');
            }

            if(confirm('Replace the current products and sales with this backup? Export your current data first if needed.')) {
                state={...clone(defaults),...data};
                delete state.backupCreated;
                cart={};
                persist();
                render();
                toast('Backup restored');
            }
        } catch(err) {
            alert('Could not import backup: '+err.message);
        }

        e.target.value='';
    };

    $('resetData').onclick=()=>{
        if(confirm('Reset ALL products, settings and sales on this device? This cannot be undone. Export a backup first if you need these records.')) {
            state=clone(defaults);
            cart={};
            persist();
            render();
            go('sell');
            toast('App data reset');
        }
    };

    $('exportCsvBtn').onclick=()=>{
        const rows=[[
            'Sale ID',
            'Date',
            'Event',
            'Payment method',
            'Total AED',
            'Cash received AED',
            'Change AED',
            'Items'
        ]];

        state.sales.forEach(s=>rows.push([
            s.id,
            s.time,
            s.event,
            s.method,
            s.total,
            s.received,
            s.change,
            s.items.map(i=>`${i.name} x${i.qty}`).join('; ')
        ]));

        const csv=rows.map(r=>
            r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')
        ).join('\r\n');

        download(
            new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),
            'little-till-sales-'+new Date().toISOString().slice(0,10)+'.csv'
        );

        toast('Sales CSV exported');
    };

    render();

    if('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('./sw.js').catch(()=>{});
    }
})();
