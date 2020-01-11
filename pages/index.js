import React from "react";
import useSWR from "swr";
import { DebounceInput } from "react-debounce-input";
import Layout from "../components/Layout";
import AnimeCard from "../components/AnimeCard";
import Loading from "../components/Loading";
import { useRouter } from "next/router";
import { getFromApi } from "../utils/api";

function showResults(results) {
  return (
    <div className="flex flex-wrap">
      {results.map(anime => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}

export default function Index() {
  const Router = useRouter();
  const { data: trending } = useSWR("/trending/anime", getFromApi);

  const [isLoading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState(Router.query.s || "");
  const [shows, setShows] = React.useState([]);

  // On initial load
  React.useEffect(() => {
    // setTrending(trend);
    if (trending) {
      setLoading(false);
    }
  }, [trending]);

  // on search change
  React.useEffect(() => {
    if (!search || search.length === 0) {
      Router.replace({
        pathname: Router.route,
        query: {}
      });
      return;
    }

    Router.replace({
      pathname: Router.route,
      query: { s: search }
    });
    setLoading(true);
    getFromApi("/anime?filter[text]=" + search).then(rsp => {
      setShows(rsp);
      setLoading(false);
    });
  }, [search]);

  let containerContent;
  let pageTitle;

  if (isLoading) {
    containerContent = <Loading />;
  } else if (search && search.length > 0) {
    pageTitle = "Results: " + search;
    containerContent = showResults(shows);
  } else if (
    trending &&
    trending.length > 0 &&
    (!search || (search && search.length === 0))
  ) {
    pageTitle = "Trending";
    containerContent = showResults(trending);
  }

  return (
    <Layout
      title="Your trending and favorited anime!"
      className="pt-6 pb-4 px-4 sm:p-8"
    >
      <header className="flex flex-col mb-6">
        <DebounceInput
          onChange={e => setSearch(e.target.value)}
          onReset={e => setSearch("")}
          value={search}
          minLength={2}
          debounceTimeout={500}
          className="SearchInput"
          type="text"
          placeholder="Search for the shows"
          spellCheck="false"
        />
      </header>
      <section className="text-white text-center text-4xl">
        {pageTitle && pageTitle.length > 0 && (
          <h1 className="text-left font-hairline text-3xl">{pageTitle}</h1>
        )}
        {containerContent}
      </section>
    </Layout>
  );
}
