const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class MovieNotesController {
  async create(request, response) {
    const { title, description, rating, tags } = request.body;
    const { user_id } = request.params;

    try {
      const movieExists = await knex("movie_notes")
        .where({ title, user_id })
        .first();

      if (movieExists) {
        throw new Error(
          "Este filme já contém uma nota cadastrada por este usuário"
        );
      }

      if (!rating) {
        throw new Error("Favor informar a nota do filme");
      }

      if (rating < 0 || rating > 5) {
        throw new Error("Favor inserir uma nota de 0 a 5");
      }

      if (!title) {
        throw new Error("Favor informar o título do filme");
      }

      const [note_id] = await knex("movie_notes").insert({
        title,
        description,
        rating,
        user_id,
      });

      if (tags) {
        const tagsTreated = tags.split(",").map((tag) => tag.trim());

        const tagsInsert = tagsTreated.map((name) => {
          return {
            note_id,
            name,
            user_id,
          };
        });

        await knex("movie_tags").insert(tagsInsert);
      }

      response.json();
    } catch (error) {
      throw new AppError(`Falha ao cadastrar a nota: ${error.message}`);
    }
  }

  async delete(request, response) {
    const { id } = request.params;

    try {
      await knex("movie_notes").where({ id }).delete();

      return response.json();
    } catch (error) {
      throw new AppError(`Falha ao excluir a nota: ${error.message}`);
    }
  }

  async show(request, response) {
    const { id } = request.params;

    const movieNotes = await knex("movie_notes")
      .select(
        "movie_notes.*",
        knex.raw("json_group_array(movie_tags.name) as Tags")
      )
      .where("movie_notes.id", id)
      .innerJoin("movie_tags", "movie_notes.id", "movie_tags.note_id")
      .groupBy("movie_notes.id")
      .first();

    return response.json(movieNotes);
  }

  async index(request, response) {
    const { title, description, rating, tag } = request.query;

    const query = knex("movie_notes")
      .select(
        "movie_notes.*",
        knex.raw("json_group_array(movie_tags.name) as Tags")
      )
      .innerJoin("movie_tags", "movie_notes.id", "movie_tags.note_id")
      .groupBy("movie_notes.id");

    if (title) {
      query.whereLike("movie_notes.title", `%${title}%`);
    }

    if (description) {
      query.whereLike("movie_notes.description", `%${description}%`);
    }

    if (rating) {
      query.where("movie_notes.rating", rating);
    }

    if (tag) {
      const tagsArray = tag.split(",").map((tag) => tag.trim());
      query.whereIn("movie_notes.id", function () {
        this.select("note_id").from("movie_tags").whereIn("name", tagsArray);
      });
    }

    const movieNotes = await query;

    return response.json(movieNotes);
  }
}

module.exports = MovieNotesController;
