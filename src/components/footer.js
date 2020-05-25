import Abstract from "./abstract";

export default class Footer extends Abstract {
  constructor(moviesModel) {
    super();
    this._films = moviesModel.films;
  }

  getTemplate() {
    return (
      `<p>${this._films.length} movies inside</p>`
    );
  }
}