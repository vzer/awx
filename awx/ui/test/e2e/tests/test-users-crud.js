/* Tests for the user CRUD operations. */
import uuid from 'uuid';

const row = '#users_table .List-tableRow';
const testID = uuid().substr(0, 8);

const store = {
    organization: {
        name: `org-${testID}`
    },
    admin: {
        email: `email-admin-${testID}@example.com`,
        firstName: `first-admin-${testID}`,
        lastName: `last-admin-${testID}`,
        password: `admin-${testID}`,
        username: `admin-${testID}`,
        type: 'administrator',
    },
    auditor: {
        email: `email-auditor-${testID}@example.com`,
        firstName: `first-auditor-${testID}`,
        lastName: `last-auditor-${testID}`,
        password: `auditor-${testID}`,
        username: `auditor-${testID}`,
        type: 'auditor',
    },
    user: {
        email: `email-${testID}@example.com`,
        firstName: `first-${testID}`,
        lastName: `last-${testID}`,
        password: `${testID}`,
        username: `user-${testID}`,
        type: 'normal',
    },
};

module.exports = {
    before: (client, done) => {
        client.login();
        client.waitForAngular();

        client.inject(
            [store, 'OrganizationModel'],
            (_store_, Model) => new Model().http.post({ data: _store_.organization }),
            ({ data }) => {
                store.organization = data;
                done();
            }
        );
    },
    'create a system administrator': (client) => {
        client.login();
        const users = client.page.users();
        users.load();
        client.waitForSpinny();
        users.create(store.admin, store.organization);
        users.search(store.admin.username);
        client.logout();
    },
    'create a system auditor': (client) => {
        client.login(store.admin.username, store.admin.password);
        const users = client.page.users();
        users.load();
        client.waitForSpinny();
        users.create(store.auditor, store.organization);
        users.search(store.auditor.username);
        client.logout();
    },
    'check if the new system auditor can login': (client) => {
        client.login(store.auditor.username, store.auditor.password);
        client.logout();
    },
    'create an user': client => {
        client.login(store.admin.username, store.admin.password);
        const users = client.page.users();
        users.load();
        client.waitForSpinny();
        const newUser = {
            email: store.user.email,
            password: store.user.password,
            username: store.user.username,
        };
        users.create(newUser, store.organization);
        users.search(newUser.username);
    },
    'edit an user': client => {
        const users = client.page.users();
        users.load();
        client.waitForSpinny();
        users.search(store.user.username);
        const editButton = `${row} i[class*="fa-pencil"]`;
        users.waitForElementVisible(editButton).click(editButton);
        users.section.edit
            .waitForElementVisible('@title')
            .setValue('@firstName', store.user.firstName)
            .setValue('@lastName', store.user.lastName)
            .click('@save');
        client.waitForSpinny();
        users.search(store.user.username);
        users.expect.element(row).text.contain(`${store.user.username}\n${store.user.firstName[0].toUpperCase() + store.user.firstName.slice(1)}\n${store.user.lastName}`);
        client.logout();
    },
    'check if the new user can login': (client) => {
        client.login(store.user.username, store.user.password);
        client.logout();
    },
    'delete admin': (client) => {
        client.login();
        const users = client.page.users();
        users.load();
        client.waitForSpinny();
        users.delete(store.admin.username);
    },
    'delete auditor': (client) => {
        const users = client.page.users();
        users.load();
        client.waitForSpinny();
        users.delete(store.auditor.username);
    },
    'delete user': (client) => {
        const users = client.page.users();
        users.load();
        client.waitForSpinny();
        users.delete(store.user.username);
    },
    after: client => {
        client.end();
    },
};
