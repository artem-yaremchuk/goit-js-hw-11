import axios from "axios";

export async function serviceImages(formData, page = 1) {

  const BASE_URL = "https://pixabay.com/api/";
  const API_KEY = "39978806-55323bcd638212dcecbd2258d";

  const params = new URLSearchParams({
    key: API_KEY,
    q: formData,
    image_type: "photo",
    orientation: "horizontal",
    safesearch: true,
    per_page: 40,
    page,
  });

  const response = await axios.get(
    `${BASE_URL}?${params}`,
  );
  return response.data;
}
