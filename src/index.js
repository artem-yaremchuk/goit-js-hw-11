import Notiflix from "notiflix";
import { serviceImages } from "./service-images.js";

const refs = {
  form: document.querySelector(".search-form"),
  searchBtn: document.querySelector(".search-btn"),
  list: document.querySelector(".gallery"),
  loadBtn: document.querySelector(".load-more"),
};

let page = 1;

let formData = "";

refs.loadBtn.classList.replace("load-more", "load-more-hidden");

refs.form.addEventListener("submit", handleSearch);
refs.loadBtn.addEventListener("click", onLoadMore);

async function handleSearch(event) {
  event.preventDefault();
  refs.searchBtn.disabled = true;

  const form = event.currentTarget;
  formData = form.elements.searchQuery.value.trim();

  if (formData === "") {
    return Notiflix.Notify.info("Please fill in the field!");
  }

  try {
    const images = await serviceImages(formData);

    if (images.hits.length === 0) {
      Notiflix.Notify.failure(
        "Sorry, there are no images matching your search query. Please try again.",
      );
    } else {
      Notiflix.Notify.info(`Hooray! We found ${images.totalHits} images`);
    }

    refs.list.innerHTML = createMarkup(images.hits);

    const currentImagesHits = page * images.perPage;

    if (currentImagesHits < images.totalHits) {
      refs.loadBtn.classList.replace("load-more-hidden", "load-more");
    }
  } catch (err) {
    console.log(err);
  } finally {
    refs.form.reset();
    refs.searchBtn.disabled = false;
  }
}

async function onLoadMore({ target }) {
  page += 1;

  target.disabled = true;

  try {
    const images = await serviceImages(formData, page);

    refs.list.insertAdjacentHTML("beforeend", createMarkup(images.hits));

    const currentImagesHits = page * images.perPage;

    if (currentImagesHits >= images.totalHits) {
      refs.loadBtn.classList.replace("load-more", "load-more-hidden");
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results.",
      );
    }
  } catch (err) {
    console.log(err);
  } finally {
    target.disabled = false;
  }
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
        <div class="photo-card">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
              <p class="info-item">
                <b>Likes: <span>${likes}</span></b>
              </p>
              <p class="info-item">
                <b>Views: <span>${views}</span></b>
              </p>
              <p class="info-item">
                <b>Comments: <span>${comments}</span></b>
              </p>
              <p class="info-item">
                <b>Downloads: <span>${downloads}</span></b>
              </p>
            </div>
        </div>`,
    )
    .join("");
}
