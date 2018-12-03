const { sq, query } = require('../tape')

describe('tutorial', () => {
  describe('Manual Queries', () => {
    describe('SQL', () => {
      query({
        name: 'parameterized argument',
        query: sq.l`select * from person where age >= ${20} and age < ${30}`,
        text: 'select * from person where age >= $1 and age < $2',
        args: [20, 30]
      })
      test('unparameterized', () => {
        expect(
          sq.l`select * from person where age >= ${20} and age < ${30}`
            .unparameterized
        ).toBe('select * from person where age >= 20 and age < 30')
      })
      query({
        name: 'chained calls',
        query: sq.l`select *`.l`from person`
          .l`where age >= ${20} and age < ${30}`,
        text: 'select * from person where age >= $1 and age < $2',
        args: [20, 30]
      })
      query({
        name: 'subquery argument',
        query: sq.l`select * from person ${sq.l`where age >= ${20} and age < ${30}`}`,
        text: 'select * from person where age >= $1 and age < $2',
        args: [20, 30]
      })
      query({
        name: 'function call',
        query: sq.l`select * from person where age >=`.l(20).l`and age <`.l(30),
        text: 'select * from person where age >= $1 and age < $2',
        args: [20, 30]
      })
    })
    describe('Raw', () => {
      query({
        name: '.l`$${arg}`',
        query: sq.l`select * from $${'test_table'}`,
        text: 'select * from test_table'
      })
      query({
        name: '.raw(arg)',
        query: sq.l`select * from`.raw('test_table').l`where id = ${7}`,
        text: 'select * from test_table where id = $1',
        args: [7]
      })
    })
    describe('Extend', () => {
      query({
        name: '.extend',
        query: sq.extend(
          sq.l`select *`,
          sq.l`from person`,
          sq.l`where age >= ${20} and age < ${30}`
        ),
        text: 'select * from person where age >= $1 and age < $2',
        args: [20, 30]
      })
    })
    describe('Link', () => {
      const books = [{ id: 1, title: '1984' }, { id: 2, title: 'Dracula' }]
      const value = book => sq.l`(${book.id}, ${book.title})`
      const values = sq.extend(...books.map(value)).link`, `
      query({
        name: 'link',
        query: sq.l`insert into book(id, title)`.l`values ${values}`.link('\n'),
        text: 'insert into book(id, title)\nvalues ($1, $2), ($3, $4)',
        args: [1, '1984', 2, 'Dracula']
      })
    })
  })

  describe('Select Queries', () => {
    describe('From', () => {
      query({
        name: '.from``',
        query: sq.from`book`,
        text: 'select * from book'
      })
      query({
        name: '.from``.from``',
        query: sq.from`book`.from`person`,
        text: 'select * from book, person'
      })
      query({
        name: ".from('', '')",
        query: sq.from('book', 'author'),
        text: 'select * from book, author'
      })
      query({
        name: '.from(sq.l``)',
        query: sq.from(sq.l`unnest(array[1, 2, 3])`),
        text: 'select * from unnest(array[1, 2, 3])',
        args: []
      })
      query({
        name: '.from object - string table source',
        query: sq.from({ b: 'book', p: 'person' }),
        text: 'select * from book as b, person as p'
      })
      query({
        name: '.from object - array of row objects',
        query: sq.from({
          people: [{ age: 7, firstName: 'Jo' }, { age: 9, firstName: 'Mo' }]
        }),
        text:
          'select * from (values ($1, $2), ($3, $4)) as people(age, first_name)',
        args: [7, 'Jo', 9, 'Mo']
      })
      query({
        name: '.from object - select subquery',
        query: sq.from({ b: sq.from`book` }),
        text: 'select * from (select * from book) as b',
        args: []
      })
      query({
        name: '.from object - subquery table source',
        query: sq.from({ countDown: sq.l`unnest(${[3, 2, 1]})` }),
        text: 'select * from unnest($1) as count_down',
        args: [[3, 2, 1]]
      })
      query({
        name: '.from - mix objects and strings',
        query: sq.from({ b: 'book' }, 'person', sq.l`author`),
        text: 'select * from book as b, person, author',
        args: []
      })
      query({
        name: '.from`join`',
        query: sq.from`book left join author on book.author_id = author.id`,
        text:
          'select * from book left join author on book.author_id = author.id'
      })
    })
    describe('Where', () => {
      query({
        name: '.where``',
        query: sq.from`book`.where`genre = ${'Fantasy'}`,
        text: 'select * from book where (genre = $1)',
        args: ['Fantasy']
      })
      query({
        name: '.where``.where``',
        query: sq.from`book`.where`genre = ${'Fantasy'}`.where`year = ${2000}`,
        text: 'select * from book where (genre = $1) and (year = $2)',
        args: ['Fantasy', 2000]
      })
      query({
        name: '.where(sq.l``)',
        query: sq.from`book`.where(sq.l`genre = ${'Fantasy'}`),
        text: 'select * from book where (genre = $1)',
        args: ['Fantasy']
      })
      query({
        name: '.where(sq.l``)',
        query: sq.from`book`.where({ genre: 'Fantasy', year: 2000 }),
        text: 'select * from book where (genre = $1 and year = $2)',
        args: ['Fantasy', 2000]
      })
      query({
        name: '.where({})',
        query: sq.from`book`.where({ genre: 'Fantasy', year: 2000 }),
        text: 'select * from book where (genre = $1 and year = $2)',
        args: ['Fantasy', 2000]
      })
      query({
        name: '.where({ camelCase })',
        query: sq.from`person`.where({ firstName: 'Kaladin' }),
        text: 'select * from person where (first_name = $1)',
        args: ['Kaladin']
      })
      query({
        name: '.where({ key: sq.raw() })',
        query: sq
          .from('book', 'author')
          .where({ 'book.id': sq.raw('author.id') }),
        text: 'select * from book, author where (book.id = author.id)',
        args: []
      })
      const condMinYear = sq.l`year >= ${20}`
      const condMaxYear = sq.l`year < ${30}`
      query({
        name: '.where({ Builder })',
        query: sq.from`person`.where({ condMinYear, condMaxYear }),
        text: 'select * from person where (year >= $1 and year < $2)',
        args: [20, 30]
      })
      query({
        name: '.where({}).where({})',
        query: sq.from`person`.where({ name: 'Rob' }, sq.l`name = ${'Bob'}`),
        text: 'select * from person where (name = $1 or name = $2)',
        args: ['Rob', 'Bob']
      })
    })
    describe('Select', () => {
      query({
        name: '.return``',
        query: sq.return`${1} as a, ${2} as b, ${1} + ${2} as sum`,
        text: 'select $1 as a, $2 as b, $3 + $4 as sum',
        args: [1, 2, 1, 2]
      })
      query({
        name: '.return``.return``',
        query: sq.from`book`.return`title, author`.return`id`,
        text: 'select title, author, id from book',
        args: []
      })
      query({
        name: '.return(string)',
        query: sq.from`book`.return('title', 'author'),
        text: 'select title, author from book',
        args: []
      })
      query({
        name: '.return(sq.l``)',
        query: sq.from`book`.return(sq.l`title`, sq.l`author`),
        text: 'select title, author from book',
        args: []
      })
      query({
        name: '.return object - string expression',
        query: sq.from`person`.return({
          firstName: 'person.first_name',
          age: 'person.age'
        }),
        text:
          'select person.first_name as first_name, person.age as age from person'
      })
      query({
        name: '.return object - subquery expression',
        query: sq.return({ sum: sq.l`${2} + ${3}`, firstName: sq.l('Bob') }),
        text: 'select $1 + $2 as sum, $3 as first_name',
        args: [2, 3, 'Bob']
      })
      query({
        name: '.distinct.return',
        query: sq.from`book`.distinct.return`genre`.return`author`,
        text: 'select distinct genre, author from book',
        args: []
      })
      query({
        name: '.distinct.distinct',
        query: sq.from`book`.distinct.distinct.return`genre`.return`author`,
        text: 'select distinct genre, author from book',
        args: []
      })
      query({
        name: '.distinctOn',
        query: sq.from`weather`.distinctOn`location`
          .return`location, time, report`,
        text:
          'select distinct on (location) location, time, report from weather',
        args: []
      })
      query({
        name: '.distinct.distinctOn',
        query: sq.from`weather`.distinctOn`location`.distinctOn`time`
          .return`location, time, report`,
        text:
          'select distinct on (location, time) location, time, report from weather',
        args: []
      })
      query({
        name: ".distinctOn('')",
        query: sq
          .from('weather')
          .distinctOn('location', 'time')
          .return('location', 'time', 'report'),
        text:
          'select distinct on (location, time) location, time, report from weather',
        args: []
      })
      query({
        name: ".distinctOn('', '').return",
        query: sq.from`generate_series(0, 10) as n`.distinctOn(sq.l`n / 3`)
          .return`n`,
        text: 'select distinct on (n / 3) n from generate_series(0, 10) as n',
        args: []
      })
    })
    describe('Select Express', () => {
      test('Express Syntax', () => {
        const name = 'Dalinar'
        // a == b and b ==c --> a == c
        const a = sq`person`
        const b = sq('person')
        const c = sq.from`person`
        expect(a.query).toEqual(b.query)
        expect(b.query).toEqual(c.query)

        const d = sq`person``name = ${name}`
        const e = sq`person`({ name })
        const f = sq.from`person`.where`name = ${name}`
        expect(d.query).toEqual(e.query)
        expect(e.query).toEqual(f.query)

        const g = sq`person``name = ${name}``age`
        const h = sq.from`person`.where`name = ${name}`.return`age`
        const i = sq
          .from('person')
          .where({ name })
          .return('age')
        expect(g.query).toEqual(h.query)
        expect(h.query).toEqual(i.query)
      })
    })
    describe('Extend', () => {
      const FantasyBook = sq.from('book').where({ genre: 'fantasy' })
      const Title = sq.return('title')
      query({
        name: 'basic',
        query: sq.extend(FantasyBook, Title),
        text: 'select title from book where (genre = $1)',
        args: ['fantasy']
      })
      query({
        name: 'middle query chain',
        query: sq
          .from('book')
          .extend(sq.where({ genre: 'fantasy' }))
          .return('title'),
        text: 'select title from book where (genre = $1)',
        args: ['fantasy']
      })
      query({
        name: 'middle query chain',
        query: sq`author`.extend(
          sq`book``book.author_id = author.id``title`,
          sq`publisher``publisher.id = book.publisher_id``publisher`
        )`author.id = 7``first_name`,
        text:
          'select title, publisher, first_name from author, book, publisher where (book.author_id = author.id) and (publisher.id = book.publisher_id) and (author.id = 7)',
        args: []
      })
    })
    describe('Group By', () => {
      query({
        name: 'tagged template',
        query: sq.from`person`.return`age, count(*)`.group`age`,
        text: 'select age, count(*) from person group by age',
        args: []
      })
      query({
        name: 'multiple calls',
        query: sq.from`person`.return`age, last_name, count(*)`.group`age`
          .group`last_name`,
        text:
          'select age, last_name, count(*) from person group by age, last_name',
        args: []
      })
      query({
        name: 'expression args',
        query: sq
          .from('person')
          .return('count(*)')
          .group('age', [sq.l`last_name`, 'first_name']),
        text:
          'select count(*) from person group by age, (last_name, first_name)',
        args: []
      })
      query({
        name: 'rollup',
        query: sq.from`t`.group(sq.rollup('a', ['b', sq.l`c`]), 'd'),
        text: 'select * from t group by rollup (a, (b, c)), d',
        args: []
      })
      query({
        name: 'cube',
        query: sq.from`t`.group(sq.cube('a', ['b', sq.l`c`]), 'd'),
        text: 'select * from t group by cube (a, (b, c)), d',
        args: []
      })
      query({
        name: 'grouping sets',
        query: sq.from`t`.group(
          sq.groupingSets(
            ['a', 'b', 'c'],
            sq.groupingSets(['a', 'b']),
            ['a'],
            []
          )
        ),
        text:
          'select * from t group by grouping sets ((a, b, c), grouping sets ((a, b)), (a), ())',
        args: []
      })
      query({
        name: 'expression args',
        query: sq.from`person`.group('age', [sq.l`last_name`, 'first_name']),
        text: 'select * from person group by age, (last_name, first_name)',
        args: []
      })
    })
    describe('Having', () => {
      query({
        name: 'tagged template',
        query: sq.from`person`.group`age`.having`age < ${20}`,
        text: 'select * from person group by age having (age < $1)',
        args: [20]
      })
      query({
        name: 'multiple calls',
        query: sq.from`person`.group`age`.having`age >= ${20}`
          .having`age < ${30}`,
        text:
          'select * from person group by age having (age >= $1) and (age < $2)',
        args: [20, 30]
      })
      query({
        name: 'chain .on and .or',
        query: sq.from`person`.group`age`
          .having({ age: 18, c: sq.l`age < ${19}` })
          .or({ age: 20 }).and`count(*) > 10`,
        text:
          'select * from person group by age having (age = $1 and age < $2) or (age = $3) and (count(*) > 10)',
        args: [18, 19, 20]
      })
    })
    describe('Order By', () => {
      query({
        name: 'tagged template',
        query: sq.from`book`.order`title asc nulls last`,
        text: 'select * from book order by title asc nulls last',
        args: []
      })
      query({
        name: 'multiple calls',
        query: sq.from`book`.order`title`.order`year`,
        text: 'select * from book order by title, year',
        args: []
      })
      query({
        name: 'expressions',
        query: sq.from`book`.order('title', sq.l`sales / ${1000}`),
        text: 'select * from book order by title, sales / $1',
        args: [1000]
      })
      query({
        name: 'object - by',
        query: sq.from`book`.order(
          { by: 'title' },
          { by: sq.l`sales / ${1000}` }
        ),
        text: 'select * from book order by title, sales / $1',
        args: [1000]
      })
      query({
        name: 'object - sort',
        query: sq.from`book`.order({ by: 'title', sort: 'desc' }),
        text: 'select * from book order by title desc',
        args: []
      })
      query({
        name: 'object - using',
        query: sq.from`person`.order({ by: 'first_name', using: '~<~' }),
        text: 'select * from person order by first_name using ~<~',
        args: []
      })
      query({
        name: 'object - nulls',
        query: sq.from`book`.order({ by: 'title', nulls: 'last' }),
        text: 'select * from book order by title nulls last',
        args: []
      })
    })
    describe('Limit', () => {
      query({
        name: 'multiple limit',
        query: sq.from`person`.limit(7).limit(5),
        text: 'select * from person limit $1',
        args: [5]
      })
      query({
        name: 'limit number',
        query: sq.from`person`.limit(8),
        text: 'select * from person limit $1',
        args: [8]
      })
      query({
        name: 'limit template string',
        query: sq.from`person`.limit`8`,
        text: 'select * from person limit 8',
        args: []
      })
      query({
        name: 'limit manual subquery',
        query: sq.from`person`.limit(sq.l`1 + 7`),
        text: 'select * from person limit 1 + 7',
        args: []
      })
      query({
        name: 'limit select subquery',
        query: sq.from`person`.limit(sq.return(10)),
        text: 'select * from person limit (select $1)',
        args: [10]
      })
    })
    describe('Offset', () => {
      query({
        name: 'multiple offset',
        query: sq.from`person`.offset(7).offset(5),
        text: 'select * from person offset $1',
        args: [5]
      })
      query({
        name: 'offset number',
        query: sq.from`person`.offset(8),
        text: 'select * from person offset $1',
        args: [8]
      })
      query({
        name: 'offset template string',
        query: sq.from`person`.offset`8`,
        text: 'select * from person offset 8',
        args: []
      })
      query({
        name: 'offset manual subquery',
        query: sq.from`person`.offset(sq.l`1 + 7`),
        text: 'select * from person offset 1 + 7',
        args: []
      })
      query({
        name: 'offset select subquery',
        query: sq.from`person`.offset(sq.return(10)),
        text: 'select * from person offset (select $1)',
        args: [10]
      })
    })
    describe('Join', () => {
      query({
        name: 'natural join',
        query: sq.from`book`.join`author`,
        text: 'select * from book natural join author',
        args: []
      })
      query({
        name: 'on',
        query: sq.from({ b: 'book' }).join({ a: 'author' })
          .on`b.author_id = a.id`,
        text:
          'select * from book as b join author as a on (b.author_id = a.id)',
        args: []
      })
      query({
        name: 'multiple on',
        query: sq
          .from({ b: 'book' })
          .join({ a: 'author' })
          .on({ 'b.author_id': sq.raw('a.id') })
          .on({ 'b.genre': 'Fantasy' }),
        text:
          'select * from book as b join author as a on (b.author_id = a.id) and (b.genre = $1)',
        args: ['Fantasy']
      })
      query({
        name: '.and / .or',
        query: sq.from({ b: 'book' }).join({ a: 'author' })
          .on`$${'b.author_id'} = $${'a.id'}`.and({ 'b.genre': 'Fantasy' })
          .or`b.special = true`,
        text:
          'select * from book as b join author as a on (b.author_id = a.id) and (b.genre = $1) or (b.special = true)',
        args: ['Fantasy']
      })
      query({
        name: 'using',
        query: sq.from`book`.join`author`.using`author_id`,
        text: 'select * from book join author using (author_id)',
        args: []
      })
      query({
        name: 'multiple using',
        query: sq.from`a`.join`b`.using('x', 'y').using`z`,
        text: 'select * from a join b using (x, y, z)',
        args: []
      })
      query({
        name: 'join type',
        query: sq.from`book`.left.join`author`.right.join`publisher`,
        text:
          'select * from book natural left join author natural right join publisher',
        args: []
      })
      query({
        name: 'multiple join type',
        query: sq.from`book`.left.right.join`author`.cross.inner
          .join`publisher`,
        text:
          'select * from book natural right join author natural join publisher',
        args: []
      })
    })
    describe('Sets', () => {
      const Person = sq.from`person`
      const Young = Person.where`age < 30`
      const Middle = Person.where`age >= 30 and age < 60`
      const Old = Person.where`age >= 60`
      query({
        name: '.except',
        query: Person.except(Young),
        text:
          'select * from person except (select * from person where (age < 30))',
        args: []
      })
      query({
        name: '.union, multiple args',
        query: Young.union(Middle, Old),
        text:
          'select * from person where (age < 30) union (select * from person where (age >= 30 and age < 60)) union (select * from person where (age >= 60))',
        args: []
      })
      query({
        name: 'union all',
        query: Young.unionAll(Old),
        text:
          'select * from person where (age < 30) union all (select * from person where (age >= 60))',
        args: []
      })
      query({
        name: 'chain set ops',
        query: Person.except(Young).intersect(Person.except(Old)),
        text:
          'select * from person except (select * from person where (age < 30)) intersect (select * from person except (select * from person where (age >= 60)))',
        args: []
      })
    })
    describe('With', () => {
      query({
        name: 'template string',
        query: sq.with`n as (select ${20} as age)`.from`n`.return`age`,
        text: 'with n as (select $1 as age) select age from n',
        args: [20]
      })
      query({
        name: 'multiple calls',
        query: sq.with`width as (select ${10} as n)`
          .with`height as (select ${20} as n)`
          .return`width.n * height.n as area`,
        text:
          'with width as (select $1 as n), height as (select $2 as n) select width.n * height.n as area',
        args: [10, 20]
      })
      query({
        name: 'subquery args',
        query: sq
          .with({
            width: sq.return({ n: 10 }),
            height: sq.l`select ${20} as n`
          })
          .return({
            area: sq.l`width.n * height.n`
          }),
        text:
          'with width as (select $1 as n), height as (select $2 as n) select width.n * height.n as area',
        args: [10, 20]
      })
      const people = [{ age: 7, name: 'Jo' }, { age: 9, name: 'Mo' }]
      query({
        name: 'object array arg',
        query: sq.with({ people }).return`max(age)`.from`people`,
        text:
          'with people(age, name) as (values ($1, $2), ($3, $4)) select max(age) from people',
        args: [7, 'Jo', 9, 'Mo']
      })
      const one = sq.return`1`
      const next = sq.return`n + 1`.from`t`.where`n < 100`
      query({
        name: 'recursive cte',
        query: sq.recursive.with({ 't(n)': one.unionAll(next) }).from`t`
          .return`sum(n)`,
        text:
          'with recursive t(n) as (select 1 union all (select n + 1 from t where (n < 100))) select sum(n) from t',
        args: []
      })
    })
  })
  describe('Delete Queries', () => {
    describe('Delete', () => {
      expect(sq.delete.from`person`.delete.query).toEqual(
        sq.from`person`.delete.query
      )
      query({
        name: '.delete',
        query: sq.delete.from`person`,
        text: 'delete from person'
      })
      query({
        name: '.delete.delete',
        query: sq`book`.delete.delete.delete,
        text: 'delete from book'
      })
    })
    describe('Where', () => {
      query({
        name: '.where.delete',
        query: sq.delete.from`person`.where`id = ${723}`,
        text: 'delete from person where (id = $1)',
        args: [723]
      })
    })
    describe('Returning', () => {
      query({
        name: '.return.delete',
        query: sq.delete.from`person`.return`name`,
        text: 'delete from person returning name'
      })
    })
    describe('Express', () => {
      query({
        name: 'express.delete',
        query: sq`person`({ job: 'student' })`name`.delete,
        text: 'delete from person where (job = $1) returning name',
        args: ['student']
      })
    })
    describe('Using', () => {
      query({
        name: 'delete using',
        query: sq.delete.from`book`.from`author`
          .where`book.author_id = author.id and author.contract = 'terminated'`,
        text:
          "delete from book using author where (book.author_id = author.id and author.contract = 'terminated')"
      })
    })
  })
  describe('Insert Queries', () => {
    describe('Insert', () => {
      query({
        name: '.insert({})',
        query: sq
          .from('person')
          .insert({ firstName: 'Shallan', lastName: 'Davar' }),
        text: 'insert into person(first_name, last_name) values ($1, $2)',
        args: ['Shallan', 'Davar']
      })
      query({
        name: '.insert(...[])',
        query: sq
          .from('person')
          .insert(
            { firstName: 'Shallan', lastName: 'Davar' },
            { firstName: 'Navani', lastName: 'Kholin' }
          ),
        text:
          'insert into person(first_name, last_name) values ($1, $2), ($3, $4)',
        args: ['Shallan', 'Davar', 'Navani', 'Kholin']
      })
      query({
        name: '.insert(...[])',
        query: sq
          .from('person')
          .insert(
            { firstName: 'Shallan', lastName: 'Davar' },
            { firstName: 'Navani', lastName: 'Kholin' }
          ),
        text:
          'insert into person(first_name, last_name) values ($1, $2), ($3, $4)',
        args: ['Shallan', 'Davar', 'Navani', 'Kholin']
      })
      query({
        name: '.insert([])',
        query: sq
          .from('person')
          .insert([
            { firstName: 'Shallan', lastName: 'Davar' },
            { firstName: 'Navani', lastName: 'Kholin' }
          ]),
        text:
          'insert into person(first_name, last_name) values ($1, $2), ($3, $4)',
        args: ['Shallan', 'Davar', 'Navani', 'Kholin']
      })
      query({
        name: '.insert({ sq.l })',
        query: sq.from('person').insert({
          firstName: sq.return`${'Shallan'}`,
          lastName: sq.l('Davar')
        }),
        text:
          'insert into person(first_name, last_name) values ((select $1), $2)',
        args: ['Shallan', 'Davar']
      })
      query({
        name: '.insert({}).insert({}).insert({})',
        query: sq
          .from('superhero(name)')
          .insert(sq.return`${'batman'}`.union(sq.return`${'superman'}`)),
        text: 'insert into superhero(name) select $1 union (select $2)',
        args: ['batman', 'superman']
      })
      query({
        name: '.insert default values',
        query: sq.from`person`.insert(),
        text: 'insert into person default values',
        args: []
      })
      query({
        name: '.insert default values',
        query: sq.from`person`
          .insert({ firstName: 'Shallan', lastName: 'Davar' })
          .insert({ firstName: 'Navani', lastName: 'Kholin' }),
        text: 'insert into person(first_name, last_name) values ($1, $2)',
        args: ['Navani', 'Kholin']
      })
    })
    describe('Returning', () => {
      query({
        name: '.insert.return',
        query: sq.from`book`.insert({ title: 'Squirrels and Acorns' })
          .return`id`,
        text: 'insert into book(title) values ($1) returning id',
        args: ['Squirrels and Acorns']
      })
    })
    describe('Express', () => {
      query({
        name: '.insert express',
        query: sq`book`()`id`.insert({ title: 'Squirrels and Acorns' }),
        text: 'insert into book(title) values ($1) returning id',
        args: ['Squirrels and Acorns']
      })
    })
  })
  describe('Update', () => {
    describe('Set', () => {
      query({
        name: '.set``',
        query: sq.from`person`.set`age = age + 1, processed = true`
          .set`name = ${'Sally'}`,
        text: 'update person set age = age + 1, processed = true, name = $1',
        args: ['Sally']
      })
      query({
        name: '.set({})',
        query: sq
          .from('person')
          .set({ firstName: 'Robert', nickname: 'Rob' }, { processed: true }),
        text:
          'update person set first_name = $1, nickname = $2, processed = $3',
        args: ['Robert', 'Rob', true]
      })
      query({
        name: '.set({})',
        query: sq.from('person').set({
          firstName: sq.l`'Bob'`,
          lastName: sq.return`'Smith'`
        }),
        text:
          "update person set first_name = 'Bob', last_name = (select 'Smith')",
        args: []
      })
      query({
        name: '.set({}).set({})',
        query: sq.from`person`
          .set({ firstName: 'Robert' })
          .set({ nickname: 'Rob' }),
        text: 'update person set first_name = $1, nickname = $2',
        args: ['Robert', 'Rob']
      })
    })
    describe('Where', () => {
      query({
        name: '.set({})',
        query: sq.from`person`
          .where({ firstName: 'Matt' })
          .set({ firstName: 'Robert', nickname: 'Rob' }),
        text:
          'update person set first_name = $1, nickname = $2 where (first_name = $3)',
        args: ['Robert', 'Rob', 'Matt']
      })
    })
    describe('Returning', () => {
      query({
        name: '.return',
        query: sq.from`person`.where`age > 60 and old = false`.set`old = true`
          .return`id, age`,
        text:
          'update person set old = true where (age > 60 and old = false) returning id, age',
        args: []
      })
    })
    describe('Express', () => {
      query({
        name: 'express.set({})',
        query: sq`person`({ firstName: 'Rob' })`id`.set({
          firstName: 'Robert'
        }),
        text:
          'update person set first_name = $1 where (first_name = $2) returning id',
        args: ['Robert', 'Rob']
      })
    })
    describe('From', () => {
      query({
        name: 'insert, from',
        query: sq.from`book`.from`author`.set({ available: false })
          .where`book.author_id = author.id and author.contract = 'terminated'`,
        text:
          "update book set available = $1 from author where (book.author_id = author.id and author.contract = 'terminated')",
        args: [false]
      })
    })
  })
})
