// controllers/productController.js

const axios = require('axios');

const BASE_URL = 'http://20.244.56.144/test';  // Base URL from the provided documentation
const COMPANIES = ["ANZ", "FLP", "SP", "HYN", "AZO"];  // Companies list from the documentation

// Helper function to fetch authorization token
const getAuthToken = async () => {
    try {
        const authUrl = `${BASE_URL}/auth`;
        const response = await axios.post(authUrl, {
            companyName: "ANKIT_PVT",  // Replace with your company name
            clientID: "081a3124-b71e-4a81-9411-d3663f72b271",  // Replace with your client ID
            clientSecret: "kEvrkKigHiJZXHfz",  // Replace with your client secret
            ownerEmail: "210305124125@paruluniversity.ac.in",  // Replace with your owner email
            rollNo: "210305124125"  // Replace with your roll number
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching auth token:', error.response ? error.response.data : error.message);
        throw new Error(`Failed to fetch auth token: ${error.message}`);
    }
};


// Helper function to fetch products from a specific company
const fetchProductsFromCompany = async (company, category, minPrice, maxPrice, token) => {
    try {
        const url = `${BASE_URL}/companies/${company}/categories/${category}/products/top-${minPrice}-${maxPrice}`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch products from ${company}: ${error.message}`);
    }
};

// GET /api/categories/:category/products
const getProducts = async (req, res) => {
    const { category } = req.params;
    const { n = 10, minPrice = 0, maxPrice = 10000, page = 1, sortBy = 'price', order = 'asc' } = req.query;

    try {
        const token = await getAuthToken();
        const allProducts = [];

        for (const company of COMPANIES) {
            const products = await fetchProductsFromCompany(company, category, minPrice, maxPrice, token);
            allProducts.push(...products);
        }

        // Sorting
        allProducts.sort((a, b) => {
            if (order === 'asc') {
                return a[sortBy] - b[sortBy];
            } else {
                return b[sortBy] - a[sortBy];
            }
        });

        // Pagination
        const startIndex = (page - 1) * n;
        const endIndex = startIndex + parseInt(n);
        const paginatedProducts = allProducts.slice(startIndex, endIndex);

        res.json(paginatedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
};

// GET /api/categories/:category/products/:productId
const getProductById = async (req, res) => {
    const { category, productId } = req.params;

    try {
        const token = await getAuthToken();
        const allProducts = [];

        for (const company of COMPANIES) {
            const products = await fetchProductsFromCompany(company, category, 0, 10000, token);
            allProducts.push(...products);
        }

        const product = allProducts.find(p => p.id === productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getProducts, getProductById };
