import Abstract from "../abstract";

export default class FilmsList extends Abstract {
  constructor() {
    super();

    this.filmsListElement = this.getElement().querySelector(`.films-list__container`);
  }

  getTemplate() {
    return (
      `<section class="films-list">
        <h2 class="films-list__title visually-hidden">All movies. Upcoming</h2>
        <div class="films-list__container"></div>
      </section>`
    );
  }
}
