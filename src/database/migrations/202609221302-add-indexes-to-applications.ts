import type {QueryInterface} from 'sequelize';

export async function up({context}: {context: QueryInterface}){
    await context.addIndex('applications', ['status'], {
        name: 'applications_status_index',
        unique: false,
    });

    await context.addIndex('applications', ['company'], {
        name: 'applications_company_index',
        unique: false,
    });

    await context.addIndex('applications', ['applied_at'], {
        name: 'applications_applied_at_index',
        unique: false,
    });
}

export async function down({context}: {context: QueryInterface}){
    await context.removeIndex('applications', 'applications_status_index');
    await context.removeIndex('applications', 'applications_company_index');
    await context.removeIndex('applications', 'applications_applied_at_index');
}