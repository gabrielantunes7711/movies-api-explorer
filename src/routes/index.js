const { Router } = require("express");

const usersRouter = require("./users.routes");
const movieNotesRouter = require("./moviesNotes.routes");
const movieTagsRoutes = require("./moviesTags.routes");

const routes = Router();

routes.use("/users", usersRouter);
routes.use("/movie_notes", movieNotesRouter);
routes.use("/movie_tags", movieTagsRoutes);

module.exports = routes;
