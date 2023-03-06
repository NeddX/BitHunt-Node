class EntityPool 
{
    constructor() 
    {
        this.pools = {};
        this.size = 0;
    }

    reserve()
    {
        console.log("To be implemented");
    }
  
    getObject(T, ...args) 
    {
        if (!this.pools[T]) 
        {
            this.pools[T] = [];
        }

        const pool = this.pools[T];
        if (pool.length > 0) 
        {
            const obj = pool.pop();

            obj.reset(...args);
            
            this.size--;
            return obj;
        } 
        else 
        {
            return new T(...args);
        }
    }
  
    releaseObject(obj) 
    {
        this.pools[obj.constructor].push(obj);
        this.size++;
    }

    collect(amount)
    {
        const p = Math.round(amount / Object.keys(this.pools).length);

        for (const [key, value] of Object.entries(this.pools)) 
        {
            const count = Math.round(this.pools[key].length * p / 100);
            for (let i = 0; i < count; ++i) 
            {
                this.pools[key].pop();
                this.size--;
            }
        }
    }

    dispose()
    {
        this.pools = {};
        this.size = 0;
        delete this;
    }
}

module.exports =
{
    EntityPool
};