import Notiflix from "notiflix";
import { serviceImages } from "./service-images.js";

// 1. отримуємо посилання на форму
// 2. вішаємо слухач подій на форму по події submit
//   2.1. привент дефолт
//   2.2. отримаємо посилання на елементи форми через form.elements
//   2.3. робимо запит на сервер (окрема ф-ція)
//   2.4. отримуємо запит і малюємо розмітку карток зображень, вставляємо через inner
//   2.5. очищаємо форму (блок файналі)
// 3. кнопка load more:
//     3.1. отримаємо рефси
//     3.2. створюємо змінну де будемо відсклідковувати поточну сторінку на яку робимо запит
//     3.3. вішаємо обробник подій на кнопку
//     3.4. викликаємо функцію для запиту (передаємо поточну сторінку)
//     3.5. завантажуємо данні, показуємо на сайті і перевіряємо, якщо це не остання сторінка - то показуємо кнопку
//     3.6. створюємо ф-цію обробник на завантаження додаткового контенту (обовʼязково робимо інкремент сторінки) ->
//          викликаємо функцію для запиту, завантажуємо данні, показуємо на сайті
//          (як тільки натискається кнопка - одразу блокуємо її, а коли отримали відповідь - можемо розблокувати, тобто блок finally)

const refs = {
  form: document.querySelector(".search-form"),
  searchBtn: document.querySelector(".search-btn"),
  list: document.querySelector(".gallery"),
  loadBtn: document.querySelector(".load-more"),
};

let page = 1;

let perPage = 40;

refs.form.addEventListener("submit", handleSearch);
refs.loadBtn.addEventListener("click", onLoadMore);

async function handleSearch(event) {
  event.preventDefault();
  refs.searchBtn.disabled = true;

  const form = event.currentTarget;
  const formData = form.elements.searchQuery.value.trim();
  console.log(formData);

  if (formData === "") {
    return Notiflix.Notify.info("Please fill in the field!");
  }

  try {
    const images = await serviceImages(formData);

    if (images.hits.length === 0) {
      Notiflix.Notify.failure(
        "Sorry, there are no images matching your search query. Please try again.",
      );
    }
    refs.list.innerHTML = createMarkup(images.hits);

    const currentImagesHits = page * perPage;

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
  const currentImagesHits = page * perPage;
  target.disabled = true;

  try {
    const images = await serviceImages(formData, page);

    refs.list.insertAdjacentHTML("beforeend", createMarkup(images.hits));

    if (currentImagesHits >= images.totalHits) {
      refs.loadBtn.classList.replace("load-more", "load-more-hidden");
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results.",
      );
    } else {
      Notiflix.Notify.info(`Hooray! We found ${images.totalHits} images`);
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
      <b>Likes: ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views: ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments: ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads: ${downloads}</b>
    </p>
  </div>
</div>`,
    )
    .join("");
}
