export default async function runMyQuery(db){
    console.log("Running MyQuery")
    console.log(db)
    console.log(db.collections)
    await db.collections.heroes.upsert({
        name: 'SomeHero2',
        color: 'red'
    });
    const query = await db.collections.heroes
    .findOne({
        selector: {}
    }).exec();
    console.log(query)
    console.log(query._data)
}