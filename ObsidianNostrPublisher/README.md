``` SQL

-- SQLite

-- SELECT * FROM markdown_nodes;

-- PRAGMA table_info(markdown_nodes);

-- SELECT title FROM markdown_nodes where title like 'ETL%';

-- SELECT title FROM markdown_nodes where title like 'Project Update Posts';

SELECT title FROM markdown_nodes where title like 'Project Update Posts' OR title like 'ETL%' OR title like 'index' order by title DESC LIMIT 10;

```