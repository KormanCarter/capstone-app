const { Pool } = require('pg');
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function viewAllTables() {
    try {
        console.log('📊 Checking your database...\n');
        
        // Get all table names
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('📁 Tables in your database:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });
        console.log('\n' + '='.repeat(60) + '\n');
        
        // For each table, show its contents
        for (const tableRow of tablesResult.rows) {
            const tableName = tableRow.table_name;
            
            // Get row count
            const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
            const rowCount = countResult.rows[0].count;
            
            console.log(`📋 Table: ${tableName.toUpperCase()} (${rowCount} rows)`);
            console.log('-'.repeat(60));
            
            if (parseInt(rowCount) === 0) {
                console.log('  (empty table)\n');
            } else {
                // Get column names
                const columnsResult = await pool.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = $1
                    ORDER BY ordinal_position
                `, [tableName]);
                
                const columns = columnsResult.rows.map(r => r.column_name);
                
                // Get all data (limit to 10 rows for safety)
                const dataResult = await pool.query(`SELECT * FROM ${tableName} LIMIT 10`);
                
                if (dataResult.rows.length > 0) {
                    console.log(`  Columns: ${columns.join(', ')}\n`);
                    
                    dataResult.rows.forEach((row, index) => {
                        console.log(`  Row ${index + 1}:`);
                        columns.forEach(col => {
                            let value = row[col];
                            // Truncate long values
                            if (typeof value === 'string' && value.length > 100) {
                                value = value.substring(0, 100) + '...';
                            }
                            console.log(`    ${col}: ${value}`);
                        });
                        console.log('');
                    });
                    
                    if (parseInt(rowCount) > 10) {
                        console.log(`  ... and ${parseInt(rowCount) - 10} more rows\n`);
                    }
                } else {
                    console.log('  (no data)\n');
                }
            }
            
            console.log('');
        }
        
    } catch (error) {
        console.error('❌ Error viewing tables:', error.message);
        console.error(error);
    } finally {
        await pool.end();
        console.log('✅ Done!');
    }
}

viewAllTables();
