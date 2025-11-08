import pandas as pd

df = pd.read_csv('output/zera_unified_price_history.csv')
real_df = df[df['is_interpolated'] == False]

print('M0N3Y (Original Pool):')
mon3y = real_df[real_df['pool_name']=='mon3y']
print(f'  Average price: ${mon3y["close"].mean():.6f}')
print(f'  Max price: ${mon3y["close"].max():.6f}')

print('\nZERA Raydium:')
Raydium = real_df[real_df['pool_name']=='zera_Raydium']
if len(Raydium) > 0:
    print(f'  Average price: ${Raydium["close"].mean():.6f}')
    print(f'  Max price: ${Raydium["close"].max():.6f}')

print('\nZERA Meteora:')
Meteora = real_df[real_df['pool_name']=='zera_Meteora']
if len(Meteora) > 0:
    print(f'  Average price: ${Meteora["close"].mean():.6f}')
    print(f'  Current price: ${Meteora["close"].iloc[-1]:.6f}')

print('\n' + '='*60)
print('If these are USD values, the axis labels need updating!')
