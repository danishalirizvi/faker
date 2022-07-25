const { faker } = require('@faker-js/faker');
const jsonexport = require('jsonexport');
const fs = require('fs');
// 1. Expense Category => 5
// 2. Supplier => 20
// 3. Product Category => 10
// 4. Customer => 1000
// 5. User => 10
// 6. Products => 30
// 7. Purchases
// 8. Expenses
// 9. Invoices
// 10. Invoice Items
const initialExpenseData = [
    { id: 1, name: "Travel" },
    { id: 2, name: "Food" },
    { id: 3, name: "Furniture" },
    { id: 4, name: "Others" },
    { id: 5, name: "Tools" },
]
function randomNumber(min, max) {
    return parseInt(Math.random() * (max - min) + min);
}
const T = {
    Supplier: 'Supplier',
    Customer: 'Customer',
    User: 'User',
    Products: 'Products',
    Purchases: 'Purchases',
    Expenses: 'Expenses',
    Invoices: 'Invoices'
}
const tablesData = [
    { name: "ExpenseCategory", rowSize: () => 5, data: initialExpenseData },
    { name: T["Supplier"], rowSize: () => 20, data: [] },
    { name: "ProductCategory", rowSize: () => 10, data: [] },
    { name: T["Customer"], rowSize: () => 1000, data: [] },
    { name: T["User"], rowSize: () => 10, data: [] },
    { name: T["Products"], rowSize: () => 30, data: [] },
    { name: T["Purchases"], rowSize: () => 5000, data: [] },
    { name: T["Expenses"], rowSize: () => 1000, data: [] },
    { name: T["Invoices"], rowSize: () => 100000, data: [] },
    { name: "InvoiceItems", rowSize: () => randomNumber(5, 15), data: [] },
];



function generateCSV(data = [], filename = "") {
    function saveOutput(err, csv) {
        if (!err) fs.writeFile(`output/${filename}.csv`, csv, console.error);
    }
    jsonexport(data, saveOutput);
}
function generateSupplierData() {
    return {
        id: (faker.database.mongodbObjectId()),
        phone: (faker.phone.number('+48 91 ### ## ##')),
        name: (faker.name.findName())
    }
}

function generateCustomerData() {
    return {
        phone: (faker.phone.number('+48 91 ### ## ##')),
        name: (faker.name.findName())
    }
}

function generateUserData() {
    const name = (faker.name.findName());
    return {
        id: (faker.database.mongodbObjectId()),
        name,
        username: (name.replace(/ /, '').toLocaleLowerCase()),
        password: '123456'
    }
}

function generateProductCategory(CategoryName) {
    const productCategory = {
        id: (faker.database.mongodbObjectId()),
        name: CategoryName
    }
    const { rowSize, data } = tablesData[2]
    if (data.length < rowSize()) {
        const alreadyExists = data.find(d => d.name === CategoryName)
        if (!alreadyExists) data.push(productCategory);
        else productCategory.id = alreadyExists.id;
    } else return tablesData[2].data[Math.floor(Math.random() * tablesData[2].data.length)]
    return productCategory;
}

function generateProductsData() {
    const product = {
        id: (faker.database.mongodbObjectId()),
        title: faker.commerce.productName(),
        salePrice: faker.commerce.price(),
        categoryId: generateProductCategory(faker.commerce.department()).id
    }
    return product;
}

function generatePurchasesData() {
    const supplier = tablesData[1].data[Math.floor(Math.random() * tablesData[1].data.length)]
    const product = tablesData[5].data[Math.floor(Math.random() * tablesData[5].data.length)]
    const purchaseData = {
        id: faker.database.mongodbObjectId(),
        supplierId: supplier.id,
        productId: product.id,
        purchasePrice: product.salePrice - randomNumber(50, 250),
        quantity: randomNumber(10, 100),
        createdAt: faker.date.between('2020-01-01T00:00:00.000Z', '2020-12-30T00:00:00.000Z')

    }
    return purchaseData;
}

function generateExpensesData() {
    const expenseCategory = tablesData[0].data[Math.floor(Math.random() * tablesData[0].data.length)]
    const user = tablesData[4].data[Math.floor(Math.random() * tablesData[4].data.length)]
    const expenseData = {
        id: faker.database.mongodbObjectId(),
        amount: faker.commerce.price(),
        description: `Buy ${expenseCategory.name}`,
        category: expenseCategory.id,
        createdBy: user.id,
        createdAt: faker.date.between('2020-01-01T00:00:00.000Z', '2020-12-30T00:00:00.000Z')

    }
    return expenseData;
}

function generateInvoiceItems(invoiceId) {
    const product = tablesData[5].data[Math.floor(Math.random() * tablesData[5].data.length)]
    const quantity = randomNumber(3, 9)
    const invoiceItem = {
        id: (faker.database.mongodbObjectId()),
        invoiceId,
        productId: product.id,
        quantity,
        total: quantity*product.salePrice
    }
    return invoiceItem;
}

function generateInvoicesData() {
    const customer = tablesData[3].data[Math.floor(Math.random() * tablesData[3].data.length)]
    const user = tablesData[4].data[Math.floor(Math.random() * tablesData[4].data.length)]
    const { rowSize, data } = tablesData[9]
    const invoiceData = {
        id: faker.database.mongodbObjectId(),
        customerPhone: customer.phone,
        total: 0,
        createdBy: user.id,
        createdAt: faker.date.between('2016-01-01T00:00:00.000Z', '2021-12-30T00:00:00.000Z')

    }
    const rS = rowSize() + data.length

    while (data.length < rS) {
        let invoiceItem = generateInvoiceItems(invoiceData.id)
        data.push(invoiceItem)
        invoiceData.total += invoiceItem.total
    }
    
    return invoiceData;
}



function generateNewData(tableName) {
    switch (tableName) {
        case 'Supplier': return generateSupplierData()
        case 'Customer': return generateCustomerData()
        case 'User': return generateUserData()
        case 'Products': return generateProductsData()
        case 'Purchases': return generatePurchasesData()
        case 'Expenses': return generateExpensesData()
        case 'Invoices': return generateInvoicesData()
    }
}

for (let index = 0; index < tablesData.length; index++) {
    const { name, rowSize, data } = tablesData[index];
    let i = 0
    if (T[name])
        while (data.length < rowSize()) {
            data.push(generateNewData(name))
        }
}

console.log("Witing CSVs")
for (let index = 0; index < tablesData.length; index++) {
    generateCSV(tablesData[index].data, tablesData[index].name)
}

console.log("Done")
