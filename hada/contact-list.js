let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

function showList(){

    const list = document.getElementById("mailList");

    list.innerHTML = "";

    contacts.forEach(function(contact,index){

        list.innerHTML += `
        <li>
            <strong>${contact.name}</strong><br>
            📧 ${contact.mail}<br>

            <button onclick="deleteContact(${index})">
                削除
            </button>

        </li>

        <br>
        `;
    });

}

function showList(){

    const list=document.getElementById("mailList");

    list.innerHTML="";

    contacts.forEach(function(contact){

        list.innerHTML +=
        `
        <li>
            <strong>${contact.name}</strong><br>
            📧 ${contact.mail}
        </li>
        <br>
        `;

    });

    function deleteContact(index){

        if(confirm("削除しますか？")){
    
            contacts.splice(index,1);
    
            localStorage.setItem(
                "contacts",
                JSON.stringify(contacts)
            );
    
            showList();
    
        }
    
    }

}