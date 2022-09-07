import * as express from "express";

async function filterMiddleware(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) {
  const { filterBy } = request.body;
  let filter = {};
  console.log(request.body);
  console.log(request.query);
  if (filterBy !== undefined)
    for (let i = 0; i < Object.keys(filterBy).length; i++) {
      if (
        filterBy[Object.keys(filterBy)[i]] !== "" &&
        filterBy[Object.keys(filterBy)[i]] !== null
      ) {
        filter[Object.keys(filterBy)[i]] = filterBy[Object.keys(filterBy)[i]];
      }
    }
  request.body.filterBy = filter;

  next();
}

export default filterMiddleware;
