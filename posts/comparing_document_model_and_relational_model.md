# Comparing Document model and Relational model

>A different language is a different vision of life.
>- Federico Fellini

While researching about MongoDB and its advantages comparing with other Relational DBMS (also called SQL databases), I fell down the rabbit-hole about philosophical ideas and concepts. One of which are Data models, which I described in [[Data Models and Storage System]].

So, in this post, I will try to tackle the question of: "What are the differences between a Document model and a Relational model database?". Or more specifically, "When to choose MongoDB over other RDBMS?".

# Comparisons

## Application code complexity
Using Document model, one can benefit a lot if the data in their application has a document-like structure (i.e, only use **One-to-many** relationships, all the data are loaded at once). When applying **Normalization** in a RDBMS, there will be more schemas/tables to manage. Also, to reconstruct the data, unnecessary join may complicate the application code.

However, when dealing with **Many-to-one** relationship, or the more sophisticated **Many-to-many** relationship, the options are reversed. Relational databases' engine is highly optimized for `JOIN` operation, so these type of query are *kind of* efficient. Document model, in contrast, does no support join by default. Application code must then use some workaround for this:
- Don't use **many-to-many** relationship at all (only for some types of data)
- De-normalizing (may require additional work to maintain consistency)
- Emulate `JOIN` in application code - sending multiple requests to DB (slower than specialized code, used by DB itself).

To recap of this part:
- For **one-to-many** relation, Document model is a clear winner
- For **many-to-many** relation, *Document model* is awkward, *Relational model* is acceptable, and *Graph models* are the most natural

## Schema flexibility
When reading about DBMS vendors advertising their product, I find that the term **schema-less** is really misleading. This is because reading the data always requires a schema. For the **schema-less** ones, the schema is described **implicitly** and is not enforced by the databases. So the more *accurate* term should be:
- **schema-on-read**: for the **schema-less** databases. ^schema-on-read
- **schema-on-write**: for the relational databases. ^schema-on-write

It can be noticed that **schema-on-read** DB is similar to dynamic (runtime) type checking programming languages (such as Python, JavaScript, ...). And **schema-on-write** DB is similar to static (compile-time) type checking. The fact that it is still a heated debate - which language is **BETTER** than the other - means that "when to enforce schema?" is not an easy question. ^c65e49

One special situation is when the external system is very dynamic, and can change at any time. Using RDBMS, it really hurts more than helps when enforcing a schema. Document model, on the other hand, is a much simpler approach. And when records are expected to share the same structure, schemas are a useful mechanism to enforcing that structure.

## Data locality for queries
For some **one-to-one** relationship, a RDBMS may split it into different tables. Document model, instead, stores them together for *storage locality*.
It's worth pointing out that this idea is not limited to Document model. For instance, BigTable (and HBase, Cassandra) used *column-family* for similar locality purpose.

# The convergence of Document and Relational DB
Most RDBMS, nowadays, support some type of XML and JSON as their own atomic type. This allows them to query inside the record naturally, similar to Document DB.
Document DB, in contrast, support some type of join in their queries, even though the performance is not absolutely good.

The convergence between these two types of models can be a good thing, because we may have the best of both world. The DB not only able to handle document-like data, but also perform relational queries on it. Programmers can choose the features that fit best to their needs.

# Conclusion

In my opinion, a hybrid document-relational DBMS may be the future. Yet, programmers still need to understand the different when choosing the optimal features for their solutions.

---

# Sidenotes

## Type of object relation

There are 4 types of relation:
- **One-to-one**: `Employee` and `Name` (`first_name`, `last_name`)
- **One-to-many**: `Employee` and `Education` (A list of schools)
- **Many-to-one**: `Employee` and `City` relation (many employees live in the same city)
- **Many-to-many**: `Employee` and `TechnicalSkill`

![[TypeOfRelations.webp|Example types of relations|400]]
