const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class MovieTagsController {
  async show(request, response) {}

  async index(request, response) {
    const { note_id, user_id } = request.query;

    const query = knex("movie_tags");

    if (note_id) {
      query.where({ note_id });
    }

    if (user_id) {
      query.where({ user_id });
    }

    const movieTags = await query;

    return response.json(movieTags);
  }

  async unique(request, response) {
    const movieTags = await knex("movie_tags").select(
      knex.raw("json_group_array(DISTINCT name) as Tags")
    );

    return response.json(movieTags);
  }
}

module.exports = MovieTagsController;
