import Abstract from "./abstract";

export default class Footer extends Abstract {
  constructor(moviesModel) {
    super();

    this._moviesModel = moviesModel;
  }

  getTemplate() {
    return (
      `<footer class="footer">
        <section class="footer__logo logo logo--smaller">Cinemaddict</section>
        <section class="footer__statistics">
          <p>${this._moviesModel.movies.length} movies inside</p>
        </section>
      </footer>`
    );
  }
}
