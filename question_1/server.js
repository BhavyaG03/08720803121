const express = require("express");
const axios = require("axios");
const app = express();
const port = 3000;

const clientID = "97af5dd1-5cb9-470c-b7d8-09c014455c93";
const clientSecret = "mgKoWJfejrwyrwAp";
const testURL = "http://20.244.56.144/test";
const minPrice = 0;
const cors = require("cors");
app.use(cors());
let accessToken = "";
const authenticate = async () => {
  try {
    const response = await axios.post(`${testURL}/auth`, {
      companyName: "Bhavya",
      clientID: clientID,
      clientSecret: clientSecret,
      ownerName: "Bhavya",
      ownerEmail: "gulatibhavya30@gmail.com",
      rollNo: "08720803121",
    });
    accessToken = response.data.access_token;
  } catch (error) {
    console.error("Error authenticating:", error);
  }
};

app.use(async (req, res, next) => {
  if (!accessToken) {
    await authenticate();
  }
  next();
});

app.get("/categories/:categoryName/products", async (req, res) => {
  const { categoryName } = req.params;
  const {
    n = 10,
    minPrice = 1,
    maxPrice = 10000,
    sort = "",
    order = "asc",
    page = 1,
  } = req.query;
  const companyNames = ["AMZ", "FLP", "SNP", "MYN", "AZO"];

  try {
    let allProducts = [];

    for (const company of companyNames) {
      const response = await axios.get(
        `${testURL}/companies/${company}/categories/${categoryName}/products`,
        {
          params: { top: n, minPrice: minPrice, maxPrice },
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      allProducts = allProducts.concat(response.data);
    }

    if (sort) {
      allProducts.sort((a, b) => {
        const comparison = order === "asc" ? 1 : -1;
        return a[sort] > b[sort] ? comparison : -comparison;
      });
    }

    const start = (page - 1) * n;
    const paginatedProducts = allProducts.slice(start, start + n);

    res.json(paginatedProducts);
  } catch (error) {
    console.error("Error fetching products:", error.response.data);
    res
      .status(500)
      .json({ errors: error.response.data.errors || "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
