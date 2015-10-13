export default class FeedContainer {

    constructor (args) {
        this.queue = [ ];
        this.unique = { };
        this.rules = args.match;
        console.log(this);
    }

    match (obj) {
        var rule, count, props, success = false;

        for (var i=0; i < this.rules.length && !success; ++i) {
            rule = this.rules[i];
            props = Object.keys(rule);

            count = 0;
            props.forEach(prop => {
                if (obj[prop] !== undefined &&
                    obj[prop] === rule[prop]) {
                    ++count;
                }
            });
            
            success = (count === props.length);
        }

        return success;
    }

}
