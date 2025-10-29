// // DATE & TIME UPDATE SECTION
function updateDateTime() {
  const now = new Date();
  document.querySelector(".date").textContent = "Date : " + now.toLocaleDateString();
  document.querySelector(".time").textContent = "Time : " + now.toLocaleTimeString();
}
setInterval(updateDateTime, 1000);
updateDateTime();

// BILL NUMBER GENERATION SECTION
function generateBillNo() {
  const now = new Date();
  const billNo =
    now.getFullYear().toString().slice(-2) +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0") +
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0");

  document.querySelector(".bill-no").textContent = "Bill No : " + billNo;
}
generateBillNo();

// PAYMENT MODE BUTTON SELECTION

let selectedPaymentMode = "N/A";

// Function to handle payment button selection 
document.querySelectorAll(".payment").forEach(button => {
  button.addEventListener("click", function() {
    document.querySelectorAll(".payment").forEach(btn => btn.classList.remove("selected"));
    this.classList.add("selected");
    selectedPaymentMode = this.textContent;
  });
});

// QUANTITY BUTTONS (+ / -) HANDLING
function attachQtyListeners(row) {
  row.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", function () {
      let qtySpan = this.parentElement.querySelector("span:nth-child(2)");
      let currentQty = parseInt(qtySpan.textContent);
      if (this.textContent === "+") currentQty++;
      else if (this.textContent === "-" && currentQty > 1) currentQty--;
      qtySpan.textContent = currentQty;
      recalcTotals();
    });
  });

  const removeBtn = row.querySelector(".remove-btn");
  if (removeBtn) {
    removeBtn.addEventListener("click", function () {
      this.closest("tr").remove();
      recalcTotals();
    });
  }

  const discountInput = row.querySelector(".discount-input");
  if (discountInput) {
    discountInput.addEventListener("input", recalcTotals);
  }
}

// BILL TOTAL RECALCULATION SECTION
function recalcTotals() {
  let grandTotal = 0;
  let totalBeforeDiscountAndTax = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  document.querySelectorAll(".products-table tbody tr").forEach(row => {
    const qty = parseInt(row.querySelector(".qty span:nth-child(2)").textContent);
    const priceCell = row.querySelector("td:nth-child(4)").textContent;
    const price = parseFloat(priceCell.replace("₹", "").trim());
    const discount = parseFloat(row.querySelector(".discount-input").value || 0);

    let lineTotal = qty * price;
    totalBeforeDiscountAndTax += lineTotal;
    totalDiscount += discount;

    let tax = (lineTotal - discount) * 0.05;
    row.querySelector(".tax").textContent = "₹ " + tax.toFixed(2);
    totalTax += tax;

    let finalTotal = lineTotal - discount + tax;
    row.querySelector("td:nth-child(7)").textContent = "₹ " + finalTotal.toFixed(2);

    grandTotal += finalTotal;
  });

  // update totals display
  document.querySelector(".div-1 h4:nth-child(2)").textContent = "Total : ₹ " + totalBeforeDiscountAndTax.toFixed(2);
  document.querySelector(".div-1 h4:nth-child(3)").textContent = "Discount : ₹ " + totalDiscount.toFixed(2);
  document.querySelector(".div-1 h4:nth-child(4)").textContent = "Tax Amount : ₹ " + totalTax.toFixed(2);
  document.querySelector(".div-1 h3").textContent = "Grand Total : ₹ " + grandTotal.toFixed(2);

  // update change due
  const received = parseFloat(document.getElementById("amount-received")?.value || 0);
  const changeDue = received - grandTotal;
  document.getElementById("change-due").textContent = "₹ " + changeDue.toFixed(2);
}

// live update for amount received
document.getElementById("amount-received")?.addEventListener("input", recalcTotals);

//  SEARCH FUNCTIONALITY
document.getElementById("searchForm").addEventListener("submit", function(e){
  e.preventDefault(); // avoid page reload
});

document.getElementById("search").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase().trim();
  document.querySelectorAll(".products-grid").forEach(product => {
    const name = product.querySelector("h3").textContent.toLowerCase();
    product.style.display = name.includes(searchTerm) ? "block" : "none";
  });
});

// ADD PRODUCT TO BILL TABLE
document.querySelectorAll(".products-grid").forEach(product => {
  product.addEventListener("click", function () {
    const productId = this.querySelector(".product-id").textContent;
    const productName = this.querySelector("h3").textContent;
    const productPrice = parseFloat(this.querySelector(".price").textContent.replace("₹", "").trim());

    const tableBody = document.querySelector(".products-table tbody");
    let existingRow = null;

    tableBody.querySelectorAll("tr").forEach(row => {
      if (row.querySelector("td:nth-child(1)").textContent.trim() === productId.trim()) {
        existingRow = row;
      }
    });

    if (existingRow) {
      let qtySpan = existingRow.querySelector(".qty span:nth-child(2)");
      let currentQty = parseInt(qtySpan.textContent);
      qtySpan.textContent = currentQty + 1;
    } else {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${productId}</td>
        <td>${productName}</td>
        <td class="qty">
          <button class="btn">-</button>
          <span>1</span>
          <button class="btn">+</button>
        </td>
        <td>₹ ${productPrice.toFixed(2)}</td>
        <td class="discount-cell">
          <input type="number" class="discount-input" value="0" min="0" />
        </td>
        <td class="tax">₹ 0.00</td>
        <td>₹ ${productPrice.toFixed(2)}</td>
        <td><button class="remove-btn">X</button></td>
      `;
      tableBody.appendChild(newRow);
      attachQtyListeners(newRow);
    }

    recalcTotals();
  });
});

// PRINT BILL FUNCTIONALITY
document.querySelector(".print-bill").addEventListener("click", () => {
  document.querySelector(".print-bill-no").textContent = document
    .querySelector(".bill-no")
    .textContent.replace("Bill No : ", "");
  document.querySelector(".print-date").textContent = document
    .querySelector(".date")
    .textContent.replace("Date : ", "");
  document.querySelector(".print-time").textContent = document
    .querySelector(".time")
    .textContent.replace("Time : ", "");

  // Use cashier select value for printing
  const cashierSelect = document.getElementById("cashierSelect");
  document.querySelector(".print-cashier").textContent = cashierSelect ? cashierSelect.value : "N/A";

  document.querySelector(".print-payment-mode").textContent = selectedPaymentMode;

  const billTableBody = document.querySelector(".bill-table tbody");
  billTableBody.innerHTML = "";
  document.querySelectorAll(".products-table tbody tr").forEach(row => {
    const item = row.querySelector("td:nth-child(2)").textContent;
    const qty = row.querySelector(".qty span:nth-child(2)").textContent;
    const price = row.querySelector("td:nth-child(4)").textContent.replace("₹ ", "");
    const discount = row.querySelector(".discount-input").value;
    const tax = row.querySelector(".tax").textContent.replace("₹ ", "");
    const total = row.querySelector("td:nth-child(7)").textContent.replace("₹ ", "");

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${item}</td>
      <td>${qty}</td>
      <td>${price}</td>
      <td>${discount}</td>
      <td>${tax}</td>
      <td>${total}</td>
    `;
    billTableBody.appendChild(newRow);
  });

  // summary section for print
  document.querySelector(".print-total").textContent = document.querySelector(
    ".div-1 h4:nth-child(2)"
  ).textContent.replace("Total : ₹ ", "₹ ");
  document.querySelector(".print-discount").textContent = document.querySelector(
    ".div-1 h4:nth-child(3)"
  ).textContent.replace("Discount : ₹ ", "₹ ");
  document.querySelector(".print-tax").textContent = document.querySelector(
    ".div-1 h4:nth-child(4)"
  ).textContent.replace("Tax Amount : ₹ ", "₹ ");
  document.querySelector(".print-grand-total").textContent = document.querySelector(
    ".div-1 h3"
  ).textContent.replace("Grand Total : ₹ ", "₹ ");
  document.querySelector(".print-received").textContent =
    "₹ " + parseFloat(document.getElementById("amount-received")?.value || 0).toFixed(2);
  document.querySelector(".print-change").textContent = document.getElementById("change-due").textContent;

  window.print();
});

// EMAIL BILL FUNCTIONALITY
document.querySelector(".mail-bill").addEventListener("click", () => {
  const email = prompt("Enter customer email address:");
  if (email && email.trim() !== "") {
    if (email.includes("@")) {
      alert(`✅ E-mail Bill successfully sent to: ${email}`);
    } else {
      alert("❌ Please enter a valid email address.");
    }
  } else if (email !== null) {
      alert("⚠️ E-mail send cancelled or no address entered.");
  }
});

// DELIVERY OPTION FUNCTIONALITY
document.querySelector(".delivery").addEventListener("click", () => {
  const name = prompt("Enter customer name:");
  const address = prompt("Enter delivery address:");
  const phone = prompt("Enter phone number:");
  if (name && address && phone) {
    alert(`🚚 Home delivery scheduled for ${name}.\nAddress: ${address}\nPhone: ${phone}`);
  }
});

// STOCK MODAL (OPEN/CLOSE) HANDLING
const modal = document.getElementById("stockModal");
const closeBtn = document.querySelector(".close");
const stockList = document.getElementById("stockList");

document.querySelector(".stock").addEventListener("click", () => {
  modal.style.display = "flex";
  stockList.innerHTML = "";
  document.querySelectorAll(".products-grid").forEach(prod => {
    const id = prod.querySelector(".product-id").textContent;
    const name = prod.querySelector("h3").textContent;
    const li = document.createElement("li");
    li.textContent = `${id} — ${name} (In Stock)`;
    stockList.appendChild(li);
  });
});

closeBtn.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", e => {
  if (e.target == modal) {
    modal.style.display = "none";
  }
});

// SELLER FULL DETAILS SECTION
const sellers = {
  agro: {
    name: "Agro Farm Limited",
    addr: "Thrippunithara, Ernakulam",
    phone: "+91 98460 00001",
    gst: "GSTIN: 32AAAAA0000A1Z5"
  },
  pythrika: {
    name: "Pythrika foods and snacks",
    addr: "Malappuram",
    phone: "+91 98460 00002",
    gst: "GSTIN: 32BBBBB0000B1Z6"
  },
  skybird: {
    name: "SkyBird Chocolate Factory",
    addr: "Coimbatore",
    phone: "+91 98460 00003",
    gst: "GSTIN: 32CCCCC0000C1Z7"
  },
  tenshen: {
    name: "Tenshen Toys Ltd",
    addr: "Chennai",
    phone: "+91 98460 00004",
    gst: "GSTIN: 32DDDDD0000D1Z8"
  }
};

const sellerSelect = document.getElementById("sellerSelect");
const sellerInfo = document.getElementById("sellerInfo");
function updateSellerInfo() {
  const key = sellerSelect.value;
  const data = sellers[key];
  if (data) {
    sellerInfo.innerHTML = `<strong>${data.name}</strong><br>${data.addr}<br>Phone: ${data.phone}<br>${data.gst}`;
  } else {
    sellerInfo.textContent = "Select a seller to view contact & address.";
  }
}
sellerSelect.addEventListener("change", updateSellerInfo);
updateSellerInfo();

// INITIAL TOTAL CALCULATION ON LOAD
recalcTotals();
