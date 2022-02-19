App = {
    loading: false,

    contracts: {},

    load: async () => {
        // console.log('app loading');
        await App.loadWeb3();
        await App.loadAccount();
        await App.loadContract();
        await App.render();
    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            console.log('111', App.web3Provider);
            web3 = new Web3(web3.currentProvider)
        } else {
            window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            console.log('333', window.web3);
            try {
                // Request account access if needed
                await ethereum.enable()
                // Acccounts now exposed
                web3.eth.sendTransaction({
                    /* ... */
                })
            } catch (error) {
                // User denied account access...
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider;
            console.log('222', App.web3Provider);
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed
            web3.eth.sendTransaction({
                /* ... */
            })
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async () => {
        App.account = web3.eth.accounts[0];
        console.log('App.account = ', App.account);
    },

    loadContract: async () => {
        const todoList = await $.getJSON('TodoList.json');
        console.log('todoList contract', todoList);
        App.contracts.TodoList = TruffleContract(todoList); // create a truffle contract, it is just a javascript representation of the smart contract that allow us to like call the functions on it, and things like that. Hence, we can interact with smart contract using javascript. This is basically giving us a copy of the contract in javascript, it can tell us where the blockchain is, and we can call those functions that is written inside of the contract.
        // In short, create a javascript version of the smart contract, it's a copy.
        console.log('App.contracts.TodoList', App.contracts.TodoList);
        App.contracts.TodoList.setProvider(App.web3Provider);

        // Hydrate the smart contract with values from the blockchain
        App.todoList = await App.contracts.TodoList.deployed();
        console.log('App.todoList', App.todoList);
    },

    render: async () => {
        if (App.loading) {
            return
        };

        App.setLoading(true);

        // Render account
        $('#account').html(App.account);

        // Render tasks
        await App.renderTasks();

        App.setLoading(false);
    },

    renderTasks: async () => {
        const $taskTemplate = $('.taskTemplate');
        const taskCount = await App.todoList.taskCount();
        for (let i = 1, len = taskCount; i <= len; i++) {
            const task = await App.todoList.tasks(i);
            console.log('task~~~', task);
            const taskId = task[0].toNumber();
            const taskContent = task[1];
            const taskCompleted = task[2];

            const $newTaskTemplate = $taskTemplate.clone();
            $newTaskTemplate.find('.content').html(taskContent)
            $newTaskTemplate.find('input')
                .prop('name', taskId)
                .prop('checked', taskCompleted)
            // .on('click', App.toggleCompleted);

            if (taskCompleted) {
                $('#completedTaskList').append($newTaskTemplate)
            } else {
                $('#taskList').append($newTaskTemplate)
            }

            $newTaskTemplate.show();
        }
    },

    setLoading: (boolean) => {
        App.loading = boolean;
        const loader = $('#loader');
        const content = $('#content');
        if (boolean) {
            loader.show();
            content.hide();
        } else {
            loader.hide();
            content.show();
        }
    }
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})