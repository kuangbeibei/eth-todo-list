const TodoList = artifacts.require('./TodoList.sol');

contract('TodoList', (accounts) => { // accounts是链接ganache里面所有的accounts，是个array

    // 先用before hook处理一些前置操作
    before(async () => {
        this.todoList = await TodoList.deployed();
    })

    // 测试一些边界情况
    it('deploys successfully', async () => {
        const address = this.todoList.address;
        assert.notEqual(address, 0x0);
        assert.notEqual(address, '');
        assert.notEqual(address, null);
        assert.notEqual(address, undefined);
    })

    it('tasks lists', async () => {
        const taskCount = await this.todoList.taskCount();
        const task = await this.todoList.tasks(taskCount); // 在app.js中，js version的取值是索引，而这里是solidity，而这里用的是小括号取值
        assert.equal(taskCount.toNumber(), task.id.toNumber()) // 可以看到，在app.js中，js version的取值是数组，而这里是solidity，是通过.id去拿的

        assert.equal(task.content, 'learning solidity');
        assert.equal(task.completed, false);
        assert.equal(taskCount.toNumber(), 1);
    })

    it('creat task', async () => {
        const result = await this.todoList.createTask('A new task');
        const taskCount = await this.todoList.taskCount();
        assert.equal(taskCount, 2);

        const event = result.logs[0].args;
        assert.equal(event.id.toNumber(), taskCount.toNumber());
        assert.equal(event.content, 'A new task');
        assert.equal(event.completed, false);
    })
})