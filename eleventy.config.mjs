import { DateTime } from "luxon";
import markdownIt from "markdown-it";
import yaml from "js-yaml";

export default function (eleventyConfig) {
  const md = markdownIt({ html: true, linkify: true });

  // Add YAML data file extension support
  eleventyConfig.addDataExtension("yml,yaml", (contents) =>
    yaml.load(contents)
  );

  // Passthrough copy for static assets
  eleventyConfig.addPassthroughCopy({ "src/assets": "public" });
  eleventyConfig.addPassthroughCopy({ "resume.pdf": "resume.pdf" });
  eleventyConfig.addPassthroughCopy({ ".htaccess": ".htaccess" });

  // Filter to exclude .git files from passthrough copy
  const excludeGit = (path) => !path.includes(".git");

  // Passthrough copy for apps (experiments, inkling, swipe-sudoku)
  eleventyConfig.addPassthroughCopy(
    { "apps/experiments": "experiments" },
    { filter: excludeGit }
  );
  eleventyConfig.addPassthroughCopy(
    { "apps/inkling": "inkling" },
    { filter: excludeGit }
  );
  eleventyConfig.addPassthroughCopy(
    { "apps/swipe-sudoku": "swipe-sudoku" },
    { filter: excludeGit }
  );

  // Special case: svg-animations-src/dist → experiments/svg-animations
  eleventyConfig.addPassthroughCopy(
    {
      "apps/experiments/svg-animations-src/dist": "experiments/svg-animations",
    },
    { filter: excludeGit }
  );

  // Watch targets for development
  eleventyConfig.addWatchTarget("./src/styles/");
  eleventyConfig.addWatchTarget("./src/scripts/");

  // Markdown filter (replaces Jekyll's markdownify)
  eleventyConfig.addFilter("markdownify", (content) => {
    if (!content) return "";
    return md.render(content);
  });

  // Date filter (replaces Jekyll's date filter)
  eleventyConfig.addFilter("date", (dateObj, format) => {
    if (!dateObj) return "";
    const dt = DateTime.fromJSDate(new Date(dateObj));

    // Map Jekyll date formats to Luxon formats
    const formatMap = {
      "%b %Y": "MMM yyyy",
      "%Y": "yyyy",
    };

    const luxonFormat = formatMap[format] || format;
    return dt.toFormat(luxonFormat);
  });

  // Current year shortcode
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  return {
    dir: {
      input: "src/pages",
      includes: "../_includes",
      layouts: "../layouts",
      data: "../_data",
      output: "dist",
    },
    templateFormats: ["njk", "html", "md"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
